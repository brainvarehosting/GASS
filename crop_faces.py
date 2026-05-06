import cv2
import numpy as np
from PIL import Image

img_path = '/Users/brainvare/.gemini/antigravity/brain/36ecdd55-9928-42b4-8bfc-70bd9caa0e8b/media__1777915736066.png'
img = cv2.imread(img_path)

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Find dark borders or use face cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
faces = face_cascade.detectMultiScale(gray, 1.1, 4)

print(f"Found {len(faces)} faces: {faces}")

names = ['ganesh', 'nagesh', 'ashutosh', 'ravindra'] # Just placeholders, we will sort and figure out
# Actually, the brochure has:
# 1. Ganesh Kumar
# 2. Ashutosh Khajuria
# 3. Nagesh Pinge
# 4. Ravindra Pandey

# Let's sort faces by Y coordinate
faces = sorted(faces, key=lambda x: x[1])

if len(faces) >= 4:
    for i in range(4):
        x, y, w, h = faces[i]
        
        # Add margin around face
        margin = int(w * 0.4)
        top_margin = int(h * 0.6)
        
        y1 = max(0, y - top_margin)
        y2 = min(img.shape[0], y + h + margin)
        x1 = max(0, x - margin)
        x2 = min(img.shape[1], x + w + margin)
        
        # Crop
        crop = img[y1:y2, x1:x2]
        
        # Save
        cv2.imwrite(f"assets/speaker-{i}.jpg", crop)
        print(f"Saved speaker-{i}.jpg, at y={y}, x={x}")
else:
    print("Could not find 4 faces")

