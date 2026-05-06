from rembg import remove
from PIL import Image
import os

names = ['ganesh', 'ashutosh', 'nagesh', 'ravindra']

for name in names:
    input_path = f"assets/speaker-{name}.jpg"
    output_path = f"assets/speaker-{name}.png"
    
    if os.path.exists(input_path):
        print(f"Processing {input_path}...")
        try:
            with open(input_path, 'rb') as i:
                input_data = i.read()
                
            output_data = remove(input_data)
            
            with open(output_path, 'wb') as o:
                o.write(output_data)
                
            print(f"Saved {output_path}")
        except Exception as e:
            print(f"Error on {name}: {e}")
            
