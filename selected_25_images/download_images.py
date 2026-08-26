import csv
import urllib.request
import os
import ssl

# Disable SSL verification for Facebook CDN URLs
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

csv_path = r"C:\Users\USER\Downloads\selected_25.csv"
output_dir = r"C:\Users\USER\Downloads\selected_25_images"

with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

total = len(rows)
success = 0
failed = 0

for i, row in enumerate(rows, 1):
    url = row["Direct_Image_URL"].strip()
    if not url:
        continue
    
    filename = f"image_{i:02d}.jpg"
    filepath = os.path.join(output_dir, filename)
    
    print(f"[{i}/{total}] Downloading {filename}...", end=" ", flush=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
            data = response.read()
            with open(filepath, "wb") as img_file:
                img_file.write(data)
        size_kb = len(data) / 1024
        print(f"OK ({size_kb:.0f} KB)")
        success += 1
    except Exception as e:
        print(f"FAILED - {e}")
        failed += 1

print(f"\nDone! {success} downloaded, {failed} failed.")
print(f"Saved to: {output_dir}")
