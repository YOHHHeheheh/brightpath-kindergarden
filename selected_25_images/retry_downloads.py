import csv
import urllib.request
import os
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

csv_path = r"C:\Users\USER\Downloads\selected_25.csv"
output_dir = r"C:\Users\USER\Downloads\selected_25_images"

with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Only retry images that failed (22-30)
failed_indices = [22, 23, 24, 25, 26, 27, 28, 29, 30]
success = 0
failed = 0

for i in failed_indices:
    row = rows[i - 1]
    url = row["Direct_Image_URL"].strip()
    if not url:
        continue
    
    filename = f"image_{i:02d}.jpg"
    filepath = os.path.join(output_dir, filename)
    
    for attempt in range(3):
        print(f"[image_{i:02d}] Attempt {attempt+1}/3...", end=" ", flush=True)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=ctx, timeout=45) as response:
                data = response.read()
                with open(filepath, "wb") as img_file:
                    img_file.write(data)
            size_kb = len(data) / 1024
            print(f"OK ({size_kb:.0f} KB)")
            success += 1
            break
        except Exception as e:
            print(f"FAILED - {e}")
            if attempt < 2:
                time.sleep(3)
    else:
        failed += 1

print(f"\nRetry done! {success} recovered, {failed} still failed.")
