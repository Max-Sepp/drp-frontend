from fastapi import APIRouter

router = APIRouter(tags=["root"])


@router.get("/")
def read_root() -> dict[str, str]:
    return {"Hello": "There is nothing here yet, but you can check out the /docs for API documentation!"}
