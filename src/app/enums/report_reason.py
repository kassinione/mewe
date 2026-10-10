from enum import StrEnum


class ReportReason(StrEnum):
    SPAM = "spam"
    INAPPROPRIATE_CONTENT = "inappropriate_content"
    HARASSMENT = "harassment"
    OTHER = "other"
