import re

# === 1. Patch OrganizerDashboard.jsx ===
dashboard_path = r"C:\Users\LOQ\projectlab\eventfinder\frontend\src\pages\OrganizerDashboard.jsx"

with open(dashboard_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the old URL input block with ImageUpload component
old_block = '''                    <div>
                      <label className="block text-sm font-medium mb-1">Poster Image URL</label>
                      <input type="url" name="poster_url" value={formData.poster_url} onChange={handleInputChange} placeholder="https://example.com/image.jpg" className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      <p className="text-xs text-gray-500 mt-1">Provide a direct link to an image. (Imgur, Discord, etc.)</p>
                    </div>'''

new_block = '''                    <ImageUpload
                      label="Event Poster Image"
                      value={formData.poster_url}
                      onChange={(url) => setFormData(prev => ({ ...prev, poster_url: url }))}
                    />'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open(dashboard_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OrganizerDashboard.jsx patched successfully!")
else:
    print("ERROR: Could not find the target block in OrganizerDashboard.jsx")
    # Print first 200 chars around 'Poster Image URL' for debugging
    idx = content.find('Poster Image URL')
    if idx != -1:
        print("Context around 'Poster Image URL':")
        print(repr(content[idx-100:idx+300]))


# === 2. Patch Register.jsx — add logo_url ImageUpload for Organizer ===
register_path = r"C:\Users\LOQ\projectlab\eventfinder\frontend\src\pages\Register.jsx"

with open(register_path, "r", encoding="utf-8") as f:
    reg_content = f.read()

# Insert ImageUpload import if not already present
if "import ImageUpload" not in reg_content:
    reg_content = reg_content.replace(
        "import api from '../services/api';",
        "import api from '../services/api';\nimport ImageUpload from '../components/ImageUpload';"
    )
    print("ImageUpload import added to Register.jsx")

# Add logo_url to formData initial state
if "'logo_url'" not in reg_content and '"logo_url"' not in reg_content:
    reg_content = reg_content.replace(
        "    social_links: ''\n  });",
        "    social_links: '',\n    logo_url: ''\n  });"
    )
    print("logo_url added to initial formData")

# Add logo_url to organizer payload
reg_content = reg_content.replace(
    "      website_url: formData.website_url,\n        social_links: formData.social_links\n      };",
    "      website_url: formData.website_url,\n        social_links: formData.social_links,\n        logo_url: formData.logo_url\n      };"
)

# Find location to insert logo ImageUpload — after the description textarea inside Organizer section
logo_insert_after = '''               </div>

               <div>
                 <label className="block text-sm font-medium mb-1 pl-1">Description</label>
                 <textarea
                   name="description"
                   value={formData.description}
                   onChange={handleChange}
                   rows="3"
                   className="w-full px-4 py-2.5 rounded-xl border border-border bg-white/50 dark:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                   required={accountType === 'organizer'}
                 ></textarea>
               </div>'''

logo_upload_block = '''               </div>

               <div>
                 <label className="block text-sm font-medium mb-1 pl-1">Description</label>
                 <textarea
                   name="description"
                   value={formData.description}
                   onChange={handleChange}
                   rows="3"
                   className="w-full px-4 py-2.5 rounded-xl border border-border bg-white/50 dark:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                   required={accountType === 'organizer'}
                 ></textarea>
               </div>

               <ImageUpload
                 label="Club Logo"
                 value={formData.logo_url}
                 onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                 required={true}
               />'''

if logo_insert_after in reg_content:
    reg_content = reg_content.replace(logo_insert_after, logo_upload_block, 1)
    print("Logo ImageUpload inserted into Register.jsx")
else:
    print("ERROR: Could not find insertion point in Register.jsx for logo upload")
    idx = reg_content.find('Description</label>')
    if idx != -1:
        print(repr(reg_content[idx-100:idx+500]))

with open(register_path, "w", encoding="utf-8") as f:
    f.write(reg_content)

print("Done patching Register.jsx")
