dashboard_path = r'C:\Users\LOQ\projectlab\eventfinder\frontend\src\pages\OrganizerDashboard.jsx'

with open(dashboard_path, encoding='utf-8') as f:
    content = f.read()

START = 14029
END   = 14587   # exclusive end after </div>

new_block = """<ImageUpload
                      label="Event Poster Image"
                      value={formData.poster_url}
                      onChange={(url) => setFormData(prev => ({ ...prev, poster_url: url }))}
                    />"""

new_content = content[:START] + new_block + content[END:]

with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done — OrganizerDashboard.jsx patched via offsets.")
