#!/usr/bin/env python3
"""
Favicon Generation Script (Python Version)

This script generates favicons from the Invent Alliance logo.

Prerequisites:
- Python 3
- Pillow: pip install Pillow

Usage:
1. Download the logo: https://www.inventallianceco.com/wp-content/uploads/2018/01/invent_mainx1.png
2. Save it as 'logo.png' in the project root
3. Run: python scripts/generate-favicon-python.py
"""

import os
import json
from PIL import Image

sizes = [
    {'name': 'favicon-16x16.png', 'size': 16},
    {'name': 'favicon-32x32.png', 'size': 32},
    {'name': 'apple-touch-icon.png', 'size': 180},
    {'name': 'android-chrome-192x192.png', 'size': 192},
    {'name': 'android-chrome-512x512.png', 'size': 512},
]

logo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logo.png')
public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public')

def generate_favicons():
    # Check if logo exists
    if not os.path.exists(logo_path):
        print('Logo file not found!')
        print('Please download the logo from:')
        print('https://www.inventallianceco.com/wp-content/uploads/2018/01/invent_mainx1.png')
        print('And save it as "logo.png" in the project root.')
        return

    # Ensure public directory exists
    os.makedirs(public_dir, exist_ok=True)

    print('Generating favicons...')

    try:
        # Open the logo
        logo = Image.open(logo_path)
        
        # Generate PNG favicons
        for item in sizes:
            name = item['name']
            size = item['size']
            
            # Resize with transparency
            favicon = logo.resize((size, size), Image.Resampling.LANCZOS)
            
            # Save as PNG
            output_path = os.path.join(public_dir, name)
            favicon.save(output_path, 'PNG')
            print(f'Generated {name}')

        # Generate favicon.ico (using 32x32 as base)
        favicon_32 = logo.resize((32, 32), Image.Resampling.LANCZOS)
        favicon_ico_path = os.path.join(public_dir, 'favicon.ico')
        favicon_32.save(favicon_ico_path, 'ICO')
        print('Generated favicon.ico')

        # Generate site.webmanifest
        manifest = {
            'name': 'Invent Alliance Limited',
            'short_name': 'Invent Alliance',
            'icons': [
                {
                    'src': '/android-chrome-192x192.png',
                    'sizes': '192x192',
                    'type': 'image/png'
                },
                {
                    'src': '/android-chrome-512x512.png',
                    'sizes': '512x512',
                    'type': 'image/png'
                }
            ],
            'theme_color': '#0f172a',
            'background_color': '#0f172a',
            'display': 'standalone'
        }

        manifest_path = os.path.join(public_dir, 'site.webmanifest')
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)
        print('Generated site.webmanifest')

        print('\nAll favicons generated successfully!')
        print('Files are in the public/ directory')
    except Exception as e:
        print(f'Error generating favicons: {str(e)}')
        print('\nMake sure Pillow is installed: pip install Pillow')

if __name__ == '__main__':
    generate_favicons()

