import enum


class EquipmentType(str, enum.Enum):
    """Types of accessibility equipment that can be reported as broken down."""

    LIFT = "lift"
    ESCALATOR = "escalator"


class Station(str, enum.Enum):
    """Stations where an outage can be reported."""

    VICTORIA = "Victoria"
    WATERLOO = "Waterloo"
    PADDINGTON = "Paddington"
    KINGS_CROSS = "King's Cross"
    LONDON_BRIDGE = "London Bridge"
