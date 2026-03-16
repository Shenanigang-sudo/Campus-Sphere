register_path = r'C:\Users\LOQ\projectlab\eventfinder\frontend\src\pages\Register.jsx'

with open(register_path, encoding='utf-8') as f:
    content = f.read()

# Find the end of the description textarea block in the Organizer section
target = '                 ></textarea>\n               </div>\n\n               <div className="grid'
replacement = """                 ></textarea>
               </div>

               <ImageUpload
                 label="Club Logo"
                 value={formData.logo_url}
                 onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
               />

               <div className=\"grid"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open(register_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Logo ImageUpload inserted into Register.jsx")
else:
    # try with \r\n
    target2 = '                 ></textarea>\r\n               </div>\r\n\r\n               <div className="grid'
    if target2 in content:
        replacement2 = """                 ></textarea>\r\n               </div>\r\n\r\n               <ImageUpload\r\n                 label="Club Logo"\r\n                 value={formData.logo_url}\r\n                 onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}\r\n               />\r\n\r\n               <div className=\"grid"""
        content = content.replace(target2, replacement2, 1)
        with open(register_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("SUCCESS (CRLF): Logo ImageUpload inserted into Register.jsx")
    else:
        # Find description in the organizer section
        idx = content.find('></textarea>', content.find('Description</label>'))
        print(f"Textarea ends at {idx}")
        print(repr(content[idx:idx+200]))
