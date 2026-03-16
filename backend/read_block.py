dashboard_path = r'C:\Users\LOQ\projectlab\eventfinder\frontend\src\pages\OrganizerDashboard.jsx'

with open(dashboard_path, encoding='utf-8') as f:
    content = f.read()

idx = content.find('Poster Image URL')
if idx == -1:
    print("Not found")
else:
    # Find the opening <div> before the label
    start = content.rfind('<div>', 0, idx)
    # Find the closing </div> after this block
    end = content.find('</div>', idx) + len('</div>')
    print(f"Block from {start} to {end}:")
    print(repr(content[start:end]))
