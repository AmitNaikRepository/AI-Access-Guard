"""
PII Detection and Masking Firewall for RoleQuest
Uses Microsoft Presidio for advanced PII detection and anonymization
"""

import logging
from typing import Dict, List, Tuple
from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Presidio engines
analyzer = None
anonymizer = None

def initialize_pii_firewall():
    """Initialize the PII detection and anonymization engines."""
    global analyzer, anonymizer

    try:
        # Create analyzer with default recognizers
        analyzer = AnalyzerEngine()
        anonymizer = AnonymizerEngine()
        logger.info("PII Firewall initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize PII Firewall: {e}")
        raise


def detect_and_mask_pii(text: str, language: str = "en") -> Tuple[str, str, List[Dict]]:
    """
    Detect and mask PII in the given text.

    Args:
        text: Input text to analyze
        language: Language code (default: "en")

    Returns:
        Tuple of (original_text, masked_text, detections)
        - original_text: The original input text
        - masked_text: Text with PII replaced by tokens
        - detections: List of detected PII entities with details
    """
    global analyzer, anonymizer

    if analyzer is None or anonymizer is None:
        initialize_pii_firewall()

    if not text or not text.strip():
        return text, text, []

    try:
        # Analyze text for PII
        results = analyzer.analyze(
            text=text,
            language=language,
            entities=[
                "EMAIL_ADDRESS",
                "PHONE_NUMBER",
                "CREDIT_CARD",
                "US_SSN",
                "PERSON",
                "LOCATION",
                "DATE_TIME",
                "US_DRIVER_LICENSE",
                "US_PASSPORT",
                "IBAN_CODE",
                "IP_ADDRESS",
                "URL"
            ]
        )

        if not results:
            # No PII detected
            return text, text, []

        # Create custom operators for masking
        operators = {
            "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "[EMAIL]"}),
            "PHONE_NUMBER": OperatorConfig("mask", {"type": "mask", "masking_char": "X", "chars_to_mask": 7, "from_end": False}),
            "CREDIT_CARD": OperatorConfig("mask", {"type": "mask", "masking_char": "X", "chars_to_mask": 12, "from_end": False}),
            "US_SSN": OperatorConfig("mask", {"type": "mask", "masking_char": "X", "chars_to_mask": 7, "from_end": False}),
            "PERSON": OperatorConfig("replace", {"new_value": "[NAME]"}),
            "LOCATION": OperatorConfig("replace", {"new_value": "[LOCATION]"}),
            "DATE_TIME": OperatorConfig("replace", {"new_value": "[DATE]"}),
            "US_DRIVER_LICENSE": OperatorConfig("replace", {"new_value": "[DL_NUMBER]"}),
            "US_PASSPORT": OperatorConfig("replace", {"new_value": "[PASSPORT]"}),
            "IBAN_CODE": OperatorConfig("replace", {"new_value": "[IBAN]"}),
            "IP_ADDRESS": OperatorConfig("replace", {"new_value": "[IP_ADDRESS]"}),
            "URL": OperatorConfig("replace", {"new_value": "[URL]"}),
            "DEFAULT": OperatorConfig("replace", {"new_value": "[REDACTED]"})
        }

        # Anonymize the text
        anonymized_result = anonymizer.anonymize(
            text=text,
            analyzer_results=results,
            operators=operators
        )

        masked_text = anonymized_result.text

        # Build detection details
        detections = []
        for result in results:
            detection = {
                "entity_type": result.entity_type,
                "start": result.start,
                "end": result.end,
                "score": result.score,
                "original_value": text[result.start:result.end],
                "masked_value": get_masked_value(result.entity_type, text[result.start:result.end])
            }
            detections.append(detection)

        logger.info(f"PII Detection: Found {len(detections)} items in text")

        return text, masked_text, detections

    except Exception as e:
        logger.error(f"Error in PII detection: {e}")
        # On error, return original text
        return text, text, []


def get_masked_value(entity_type: str, original_value: str) -> str:
    """Get the masked representation of a PII value."""
    if entity_type == "EMAIL_ADDRESS":
        return "[EMAIL]"
    elif entity_type == "PHONE_NUMBER":
        # Show last 4 digits
        if len(original_value) >= 4:
            return f"[PHONE_XXX{original_value[-4:]}]"
        return "[PHONE]"
    elif entity_type == "CREDIT_CARD":
        # Show last 4 digits
        digits = ''.join(c for c in original_value if c.isdigit())
        if len(digits) >= 4:
            return f"[CARD_XXXX{digits[-4:]}]"
        return "[CARD]"
    elif entity_type == "US_SSN":
        # Show last 4 digits
        digits = ''.join(c for c in original_value if c.isdigit())
        if len(digits) >= 4:
            return f"[SSN_XXX-XX-{digits[-4:]}]"
        return "[SSN]"
    elif entity_type == "PERSON":
        return "[NAME]"
    elif entity_type == "LOCATION":
        return "[LOCATION]"
    elif entity_type == "DATE_TIME":
        return "[DATE]"
    elif entity_type == "US_DRIVER_LICENSE":
        return "[DL_NUMBER]"
    elif entity_type == "US_PASSPORT":
        return "[PASSPORT]"
    elif entity_type == "IBAN_CODE":
        return "[IBAN]"
    elif entity_type == "IP_ADDRESS":
        return "[IP_ADDRESS]"
    elif entity_type == "URL":
        return "[URL]"
    else:
        return "[REDACTED]"


def get_pii_summary(detections: List[Dict]) -> Dict[str, int]:
    """
    Get a summary of detected PII types and counts.

    Args:
        detections: List of detection dictionaries

    Returns:
        Dictionary mapping entity types to counts
    """
    summary = {}
    for detection in detections:
        entity_type = detection["entity_type"]
        summary[entity_type] = summary.get(entity_type, 0) + 1
    return summary


def format_detection_message(detections: List[Dict]) -> str:
    """
    Format a user-friendly message about detected PII.

    Args:
        detections: List of detection dictionaries

    Returns:
        Formatted string describing what was detected
    """
    if not detections:
        return "No PII detected"

    summary = get_pii_summary(detections)
    items = []

    for entity_type, count in summary.items():
        friendly_name = entity_type.replace("_", " ").title()
        if count == 1:
            items.append(f"1 {friendly_name}")
        else:
            items.append(f"{count} {friendly_name}s")

    return f"Protected: {', '.join(items)}"


# Initialize on module import
try:
    initialize_pii_firewall()
except Exception as e:
    logger.warning(f"PII Firewall initialization delayed: {e}")
