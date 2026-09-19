from ..models import Category


def get_all_categories() -> list[Category]:
    categories = (
        Category.query
        .order_by(Category.name.asc())
        .all()
    )

    return categories
