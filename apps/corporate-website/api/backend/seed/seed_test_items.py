"""Seed MongoDB collections with design test questions, images, and supplemental metadata."""

import asyncio
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

from app.db import (
    close_client,
    get_client,
    get_images_collection,
    get_questions_collection,
    get_supplemental_questions_collection,
)

load_dotenv()

PUBLIC_DIR = Path("public")
IMAGE_PATTERN = re.compile(r"^(?P<question>\d+?)_(?P<score>[0-2])_(?P<kind>[a-zA-Z0-9-]+)$")

SUPPLEMENTAL_DATA = [
    {
        "questionNumber": 9,
        "kind": "selection",
        "prompt": "Which item would you add to the Minkowski catalogue if you joined the product team?",
        "correctOptionId": "B",
        "options": [
            {"optionId": "A", "label": "A. A white matte vase made of plastic", "value": 0},
            {
                "optionId": "B",
                "label": "B. A black glossy vase made with 60% corn-based bioplastic and 40% recycled wood fibers",
                "value": 2,
            },
            {
                "optionId": "C",
                "label": "C. A matte off-white clean and minimal Avengers figurine",
                "value": 0,
            },
            {
                "optionId": "D",
                "label": "D. A minimal burgundy sofa Japandi style",
                "value": 1,
            },
        ],
    },
    {
        "questionNumber": 10,
        "kind": "boost",
        "prompt": "If you join Minkowski, which role excites you the most?",
        "options": [
            {
                "optionId": "A",
                "label": "A. Product Selection · Curation · Writing Descriptions",
                "boost": 0.08,
            },
            {
                "optionId": "B",
                "label": "B. Write Ad copies · Create content · Post on Social",
                "boost": 0.10,
            },
            {
                "optionId": "C",
                "label": "C. Ads and sales · Data analysis (requires Data Test)",
                "boost": 0.20,
            },
            {
                "optionId": "D",
                "label": "D. Bookkeeping · Accounts (no openings currently)",
                "boost": 0.10,
            },
        ],
    },
]


async def seed() -> None:
    if not PUBLIC_DIR.exists():
        raise FileNotFoundError("public directory not found; nothing to seed")

    await get_client()
    questions_collection = await get_questions_collection()
    images_collection = await get_images_collection()
    supplemental_collection = await get_supplemental_questions_collection()

    await images_collection.delete_many({})
    await questions_collection.delete_many({})
    await supplemental_collection.delete_many({})

    grouped: dict[int, dict[str, any]] = defaultdict(lambda: {"images": []})

    for path in PUBLIC_DIR.iterdir():
        if not path.is_file():
            continue
        stem = path.stem
        match = IMAGE_PATTERN.match(stem)
        if not match:
            continue

        question_number = int(match.group("question"))
        score = int(match.group("score"))
        kind = match.group("kind").lower()

        grouped_entry = grouped[question_number]
        grouped_entry.setdefault("questionType", kind if kind in {"homestyle", "product"} else "homestyle")

        grouped_entry["images"].append(
            {
                "imageId": stem,
                "src": f"/{path.name}",
                "actualScore": score,
                "imageType": kind if kind in {"homestyle", "product"} else "homestyle",
                "displayLabel": None,
                "filename": path.name,
            }
        )

    if not grouped:
        raise RuntimeError("No matching image assets found in public/ directory")

    now = datetime.now(timezone.utc)

    total_images = 0
    for question_number, payload in sorted(grouped.items()):
        images = sorted(payload["images"], key=lambda img: img["imageId"])
        for image in images:
            image_payload = {
                **image,
                "questionNumber": question_number,
                "createdAt": now,
                "updatedAt": now,
            }
            await images_collection.insert_one(image_payload)
            total_images += 1

        question_payload = {
            "questionNumber": question_number,
            "questionType": payload["questionType"],
            "images": images,
            "createdAt": now,
            "updatedAt": now,
        }
        await questions_collection.insert_one(question_payload)

    await supplemental_collection.insert_many([
        {
            **doc,
            "createdAt": now,
            "updatedAt": now,
        }
        for doc in SUPPLEMENTAL_DATA
    ])

    print(
        f"Seeded {len(grouped)} image questions, {total_images} images, and {len(SUPPLEMENTAL_DATA)} supplemental questions from {PUBLIC_DIR}."
    )


async def main() -> None:
    try:
        await seed()
    finally:
        await close_client()


if __name__ == "__main__":
    asyncio.run(main())
