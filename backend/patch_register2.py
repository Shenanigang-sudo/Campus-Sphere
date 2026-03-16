register_path = r'C:\Users\LOQ\projectlab\eventfinder\frontend\src\pages\Register.jsx'

with open(register_path, encoding='utf-8') as f:
    content = f.read()

# Find exact position after the description textarea close
textarea_idx = content.find('></textarea>', content.find('Description</label>'))
close_div_after = content.find('</div>', textarea_idx) + len('</div>')

print(f"Insertion point (after description's </div>): {close_div_after}")
print(repr(content[close_div_after:close_div_after+20]))

logo_upload = """\r\n\r\n               <ImageUpload\r\n                 label="Club Logo"\r\n                 value={formData.logo_url}\r\n                 onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}\r\n               />"""

new_content = content[:close_div_after] + logo_upload + content[close_div_after:]

with open(register_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("SUCCESS: Logo ImageUpload inserted at offset.")
