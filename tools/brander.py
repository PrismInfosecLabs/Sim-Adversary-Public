#!/usr/bin/env python3
"""
Sim-Adversary Visual Theme Customizer
A tool to rebrand the core visual elements while maintaining readability
Enhanced with header gradient customization, dedicated sidebar theming, and dialog/alert controls
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, colorchooser
import json
import re
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import colorsys

class VisualThemeCustomizer:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Sim-Adversary Visual Theme Customizer v3.3")
        self.root.geometry("1200x950")
        self.root.configure(bg='#2d3748')
        
        # Make the window resizable and set minimum size
        self.root.resizable(True, True)
        self.root.minsize(800, 600)  # Set minimum window size
        
        # Configure root grid weights for proper scaling
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(0, weight=1)

        # Core visual theme configuration
        self.current_theme = {
            "name": "Default Dark",
            "visual_scheme": {
                # Header theme
                "header_primary": "#06bb8e",     # Main header color
                "header_text": "#ffffff",        # Header text

                # Background theme
                "page_background": "#222222",    # Main page background
                "container_background": "#444444", # Cards, forms, step container
                "container_light": "#555555",    # Lighter container elements

                # Sidebar Theme
                "sidebar_bg": "#2d3748",          # Sidebar panel background
                "sidebar_text": "#e2e8f0",        # Sidebar panel general text
                "sidebar_header_bg": "#4a5568",   # Sidebar panel header background
                "sidebar_header_text": "#ffffff", # Sidebar panel header text

                # Alert/Dialog Theme (NEW)
                "detection_bg": "#7f1d1d",        # Detection dialog background
                "detection_text": "#ffffff",      # Detection dialog text
                "detection_header_bg": "#dc2626", # Detection dialog header background
                "detection_header_text": "#ffffff", # Detection dialog header text
                "contingency_bg": "#064e3b",      # Contingency dialog background
                "contingency_text": "#ffffff",    # Contingency dialog text
                "contingency_header_bg": "#059669", # Contingency dialog header background
                "contingency_header_text": "#ffffff", # Contingency dialog header text
                "warning_bg": "#7f1d1d",          # Warning banner background
                "warning_text": "#ffffff",        # Warning banner text

                # Text theme
                "text_primary": "#eeeeee",       # Main text color
                "text_secondary": "#9ca3af",     # Secondary/muted text

                # Header colors (granular control)
                "h1_color": "#ffffff",           # H1 headers
                "h2_color": "#ffffff",           # H2 headers
                "h3_color": "#ffffff",           # H3 headers
                "h4_color": "#e5e7eb",           # H4 headers
                "h5_color": "#d1d5db",           # H5 headers
                "h6_color": "#9ca3af",           # H6 headers

                # Border and accent theme
                "border_color": "#666666",       # General borders
                "accent_border": "#4a5568",      # Sidebar/section borders

                # Header gradient configuration
                "header_gradient_type": "preset",    # preset, custom, solid, none
                "header_gradient_preset": "rainbow", # rainbow, fire, ocean, sunset, forest, cyber, grayscale
                "header_gradient_colors": [          # Custom gradient colors (up to 9 colors)
                    "#87ceeb", "#0000ff", "#800080", "#8b0000",
                    "#ff0000", "#ffa500", "#ffff00", "#90ee90", "#006400"
                ],
                "header_gradient_solid_color": "#06bb8e",  # Solid color option

                # Table theme
                "table_header_bg": "#3182ce",    # Table header background
                "table_header_text": "#ffffff", # Table header text
                "table_row_bg": "#f9fafb",      # Table row background
                "table_row_alt": "#f3f4f6",     # Alternate table row background
                "table_text": "#1f2937",        # Table text color
                "table_border": "#e5e7eb",      # Table borders

                # Form theme
                "input_bg": "#ffffff",           # Input field background
                "input_border": "#d1d5db",      # Input field border
                "input_text": "#1f2937",        # Input field text
                "input_placeholder": "#9ca3af", # Input placeholder text
                "input_focus_border": "#3b82f6", # Input focus border
                "form_label": "#374151",         # Form label text
            },
            "interaction_colors": {
                # These stay as brand colors for buttons/interactions
                "primary": "#3182ce",
                "primary_hover": "#2c5282",
                "secondary": "#059669",
                "secondary_hover": "#047857",
                "accent": "#C20066",
                "accent_hover": "#a0004d",
                "danger": "#dc2626",
                "danger_hover": "#b91c1c",
                "warning": "#f59e0b",
                "warning_hover": "#d97706",
            }
        }

        self.css_file_path = ""
        self.output_file_path = ""

        # Predefined gradient presets (with validated hex colors)
        self.gradient_presets = {
            "rainbow": ["#87ceeb", "#0000ff", "#800080", "#8b0000", "#ff0000", "#ffa500", "#ffff00", "#90ee90", "#006400"],
            "fire": ["#ff4500", "#ff6347", "#ff8c00", "#ffd700", "#ffff00"],
            "ocean": ["#000080", "#0000cd", "#1e90ff", "#00bfff", "#87ceeb"],
            "sunset": ["#ff4500", "#ff6347", "#ff69b4", "#dda0dd", "#9370db"],
            "forest": ["#228b22", "#32cd32", "#90ee90", "#98fb98", "#f0fff0"],
            "cyber": ["#00ffff", "#0080ff", "#8000ff", "#ff00ff", "#ff0080"],
            "grayscale": ["#000000", "#404040", "#808080", "#c0c0c0", "#ffffff"],
            "warm": ["#8b0000", "#dc143c", "#ff6347", "#ffa500", "#ffd700"],
            "cool": ["#000080", "#4169e1", "#6495ed", "#87ceeb", "#b0e0e6"],
            "neon": ["#ff1493", "#00ff00", "#1e90ff", "#ffd700", "#ff69b4"]
        }

        # Updated predefined theme presets with new dialog fields
        self.theme_presets = {
            "Default Dark": {
                "header_primary": "#06bb8e", "header_text": "#ffffff",
                "page_background": "#222222", "container_background": "#444444",
                "container_light": "#555555", "text_primary": "#eeeeee",
                "sidebar_bg": "#2d3748", "sidebar_text": "#e2e8f0", "sidebar_header_bg": "#4a5568", "sidebar_header_text": "#ffffff",
                "detection_bg": "#7f1d1d", "detection_text": "#ffffff", "detection_header_bg": "#dc2626", "detection_header_text": "#ffffff",
                "contingency_bg": "#064e3b", "contingency_text": "#ffffff", "contingency_header_bg": "#059669", "contingency_header_text": "#ffffff",
                "warning_bg": "#7f1d1d", "warning_text": "#ffffff",
                "text_secondary": "#9ca3af", "h1_color": "#ffffff", "h2_color": "#ffffff",
                "h3_color": "#ffffff", "h4_color": "#e5e7eb", "h5_color": "#d1d5db", "h6_color": "#9ca3af",
                "border_color": "#666666", "accent_border": "#4a5568",
                "header_gradient_type": "preset", "header_gradient_preset": "rainbow",
                "header_gradient_solid_color": "#06bb8e",
                "table_header_bg": "#3182ce", "table_header_text": "#ffffff", "table_row_bg": "#374151",
                "table_row_alt": "#4b5563", "table_text": "#e5e7eb", "table_border": "#6b7280",
                "input_bg": "#374151", "input_border": "#6b7280", "input_text": "#f3f4f6",
                "input_placeholder": "#9ca3af", "input_focus_border": "#60a5fa", "form_label": "#d1d5db",
                "interaction_colors": {
                "primary": "#3182ce", "primary_hover": "#2c5282", 
                "secondary": "#059669", "secondary_hover": "#047857", 
                "accent": "#C20066", "accent_hover": "#a0004d",
                "danger": "#dc2626", "danger_hover": "#b91c1c", 
                "warning": "#f59e0b", "warning_hover": "#d97706",
                }
            },
            "Corporate Blue": {
                "header_primary": "#1e3a8a", "header_text": "#ffffff",
                "page_background": "#0f172a", "container_background": "#1e293b",
                "container_light": "#334155", "text_primary": "#f1f5f9",
                "sidebar_bg": "#1e293b", "sidebar_text": "#f1f5f9", "sidebar_header_bg": "#334155", "sidebar_header_text": "#ffffff",
                "detection_bg": "#7f1d1d", "detection_text": "#ffffff", "detection_header_bg": "#dc2626", "detection_header_text": "#ffffff",
                "contingency_bg": "#064e3b", "contingency_text": "#ffffff", "contingency_header_bg": "#059669", "contingency_header_text": "#ffffff",
                "warning_bg": "#7f1d1d", "warning_text": "#ffffff",
                "text_secondary": "#94a3b8", "h1_color": "#ffffff", "h2_color": "#e2e8f0",
                "h3_color": "#cbd5e1", "h4_color": "#94a3b8", "h5_color": "#64748b", "h6_color": "#475569",
                "border_color": "#475569", "accent_border": "#64748b",
                "header_gradient_type": "preset", "header_gradient_preset": "ocean",
                "header_gradient_solid_color": "#1e3a8a",
                "table_header_bg": "#1e40af", "table_header_text": "#ffffff", "table_row_bg": "#334155",
                "table_row_alt": "#475569", "table_text": "#e2e8f0", "table_border": "#64748b",
                "input_bg": "#334155", "input_border": "#64748b", "input_text": "#f1f5f9",
                "input_placeholder": "#94a3b8", "input_focus_border": "#3b82f6", "form_label": "#cbd5e1",
                "interaction_colors": {
                    "primary": "#3b82f6", "primary_hover": "#2563eb",
                    "secondary": "#06b6d4", "secondary_hover": "#0891b2",
                    "accent": "#f59e0b", "accent_hover": "#d97706",
                    "danger": "#f87171", "danger_hover": "#ef4444",
                    "warning": "#fbbf24", "warning_hover": "#f59e0b",
                }
            },
            "Forest Green": {
                "header_primary": "#166534", "header_text": "#ffffff",
                "page_background": "#0c1810", "container_background": "#1f2937",
                "container_light": "#374151", "text_primary": "#f9fafb",
                "sidebar_bg": "#1f2937", "sidebar_text": "#f9fafb", "sidebar_header_bg": "#374151", "sidebar_header_text": "#ffffff",
                "detection_bg": "#7f1d1d", "detection_text": "#ffffff", "detection_header_bg": "#dc2626", "detection_header_text": "#ffffff",
                "contingency_bg": "#064e3b", "contingency_text": "#ffffff", "contingency_header_bg": "#059669", "contingency_header_text": "#ffffff",
                "warning_bg": "#7f1d1d", "warning_text": "#ffffff",
                "text_secondary": "#9ca3af", "h1_color": "#ffffff", "h2_color": "#f3f4f6",
                "h3_color": "#e5e7eb", "h4_color": "#d1d5db", "h5_color": "#9ca3af", "h6_color": "#6b7280",
                "border_color": "#4b5563", "accent_border": "#6b7280",
                "header_gradient_type": "preset", "header_gradient_preset": "forest",
                "header_gradient_solid_color": "#166534",
                "table_header_bg": "#059669", "table_header_text": "#ffffff", "table_row_bg": "#374151",
                "table_row_alt": "#4b5563", "table_text": "#e5e7eb", "table_border": "#6b7280",
                "input_bg": "#374151", "input_border": "#6b7280", "input_text": "#f9fafb",
                "input_placeholder": "#9ca3af", "input_focus_border": "#10b981", "form_label": "#d1d5db",
                "interaction_colors": {
                    "primary": "#22c55e", "primary_hover": "#16a34a",
                    "secondary": "#f97316", "secondary_hover": "#ea580c",
                    "accent": "#eab308", "accent_hover": "#ca8a04",
                    "danger": "#f87171", "danger_hover": "#ef4444",
                    "warning": "#fbbf24", "warning_hover": "#f59e0b",
                }
            },
            "Purple Haze": {
                "header_primary": "#7c2d12", "header_text": "#ffffff",
                "page_background": "#1c1917", "container_background": "#292524",
                "container_light": "#44403c", "text_primary": "#fafaf9",
                "sidebar_bg": "#292524", "sidebar_text": "#fafaf9", "sidebar_header_bg": "#44403c", "sidebar_header_text": "#ffffff",
                "detection_bg": "#7f1d1d", "detection_text": "#ffffff", "detection_header_bg": "#dc2626", "detection_header_text": "#ffffff",
                "contingency_bg": "#064e3b", "contingency_text": "#ffffff", "contingency_header_bg": "#059669", "contingency_header_text": "#ffffff",
                "warning_bg": "#7f1d1d", "warning_text": "#ffffff",
                "text_secondary": "#a8a29e", "h1_color": "#ffffff", "h2_color": "#f5f5f4",
                "h3_color": "#e7e5e4", "h4_color": "#d6d3d1", "h5_color": "#a8a29e", "h6_color": "#78716c",
                "border_color": "#57534e", "accent_border": "#78716c",
                "header_gradient_type": "preset", "header_gradient_preset": "sunset",
                "header_gradient_solid_color": "#7c2d12",
                "table_header_bg": "#92400e", "table_header_text": "#ffffff", "table_row_bg": "#44403c",
                "table_row_alt": "#57534e", "table_text": "#e7e5e4", "table_border": "#78716c",
                "input_bg": "#44403c", "input_border": "#78716c", "input_text": "#fafaf9",
                "input_placeholder": "#a8a29e", "input_focus_border": "#f59e0b", "form_label": "#d6d3d1",
                "interaction_colors": {
                            "primary": "#a855f7", "primary_hover": "#9333ea",
                            "secondary": "#f59e0b", "secondary_hover": "#d97706",
                            "accent": "#ec4899", "accent_hover": "#db2777",
                            "danger": "#f87171", "danger_hover": "#ef4444",
                            "warning": "#fbbf24", "warning_hover": "#f59e0b",
                }
            },
            "Light Professional": {
                "header_primary": "#2563eb", "header_text": "#ffffff",
                "page_background": "#f8fafc", "container_background": "#ffffff",
                "container_light": "#f1f5f9", "text_primary": "#1e293b",
                "sidebar_bg": "#ffffff", "sidebar_text": "#334155", "sidebar_header_bg": "#e2e8f0", "sidebar_header_text": "#1e293b",
                "detection_bg": "#dc2626", "detection_text": "#ffffff", "detection_header_bg": "#b91c1c", "detection_header_text": "#ffffff",
                "contingency_bg": "#059669", "contingency_text": "#ffffff", "contingency_header_bg": "#047857", "contingency_header_text": "#ffffff",
                "warning_bg": "#dc2626", "warning_text": "#ffffff",
                "text_secondary": "#64748b", "h1_color": "#0f172a", "h2_color": "#1e293b",
                "h3_color": "#334155", "h4_color": "#475569", "h5_color": "#64748b", "h6_color": "#94a3b8",
                "border_color": "#cbd5e1", "accent_border": "#94a3b8",
                "header_gradient_type": "solid", "header_gradient_preset": "rainbow",
                "header_gradient_solid_color": "#2563eb",
                "table_header_bg": "#3b82f6", "table_header_text": "#ffffff", "table_row_bg": "#ffffff",
                "table_row_alt": "#f8fafc", "table_text": "#1e293b", "table_border": "#e2e8f0",
                "input_bg": "#ffffff", "input_border": "#d1d5db", "input_text": "#1e293b",
                "input_placeholder": "#9ca3af", "input_focus_border": "#3b82f6", "form_label": "#374151",
                "interaction_colors": {
                    "primary": "#1e40af", "primary_hover": "#1e3a8a",
                    "secondary": "#047857", "secondary_hover": "#065f46",
                    "accent": "#7c2d12", "accent_hover": "#92400e",
                    "danger": "#dc2626", "danger_hover": "#b91c1c",
                    "warning": "#d97706", "warning_hover": "#b45309",
                }
            },
            "Prism Infosec": {
                "header_primary": "#02FFE0", "header_text": "#1E164D",
                "page_background": "#CCFFF9", "container_background": "#ffffff",
                "container_light": "#f0fffe", "text_primary": "#1E164D",
                "sidebar_bg": "#ffffff", "sidebar_text": "#1E164D", "sidebar_header_bg": "#80d6d3", "sidebar_header_text": "#1E164D",
                "detection_bg": "#dc2626", "detection_text": "#ffffff", "detection_header_bg": "#b91c1c", "detection_header_text": "#ffffff",
                "contingency_bg": "#059669", "contingency_text": "#ffffff", "contingency_header_bg": "#047857", "contingency_header_text": "#ffffff",
                "warning_bg": "#dc2626", "warning_text": "#ffffff",
                "text_secondary": "#2a1f5f", "h1_color": "#1E164D", "h2_color": "#2a235f",
                "h3_color": "#363071", "h4_color": "#423d83", "h5_color": "#4e4a95", "h6_color": "#5a57a7",
                "border_color": "#80d6d3", "accent_border": "#02FFE0",
                "header_gradient_type": "preset", "header_gradient_preset": "cyber",
                "header_gradient_solid_color": "#02FFE0",
                "table_header_bg": "#02FFE0", "table_header_text": "#1E164D", "table_row_bg": "#ffffff",
                "table_row_alt": "#f0fffe", "table_text": "#1E164D", "table_border": "#80d6d3",
                "input_bg": "#ffffff", "input_border": "#80d6d3", "input_text": "#1E164D",
                "input_placeholder": "#4a4a8a", "input_focus_border": "#02FFE0", "form_label": "#1E164D",
                "interaction_colors": {
                    "primary": "#0891b2", "primary_hover": "#0e7490",
                    "secondary": "#7c3aed", "secondary_hover": "#6d28d9",
                    "accent": "#db2777", "accent_hover": "#be185d",
                    "danger": "#dc2626", "danger_hover": "#b91c1c",
                    "warning": "#d97706", "warning_hover": "#b45309",
                }
            }
        }

        self.setup_ui()

    def calculate_contrast_ratio(self, color1: str, color2: str) -> float:
        """Calculate contrast ratio between two colors"""
        def hex_to_rgb(hex_color):
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

        def luminance(rgb):
            r, g, b = [c/255.0 for c in rgb]
            r = r/12.92 if r <= 0.03928 else ((r+0.055)/1.055)**2.4
            g = g/12.92 if g <= 0.03928 else ((g+0.055)/1.055)**2.4
            b = b/12.92 if b <= 0.03928 else ((b+0.055)/1.055)**2.4
            return 0.2126*r + 0.7152*g + 0.0722*b

        try:
            rgb1 = hex_to_rgb(color1)
            rgb2 = hex_to_rgb(color2)
            lum1 = luminance(rgb1)
            lum2 = luminance(rgb2)

            if lum1 > lum2:
                return (lum1 + 0.05) / (lum2 + 0.05)
            else:
                return (lum2 + 0.05) / (lum1 + 0.05)
        except:
            return 1.0

    def auto_adjust_text_color(self, background_color: str) -> str:
        """Auto-adjust text color based on background for optimal contrast"""
        light_text = "#ffffff"
        dark_text = "#000000"

        light_contrast = self.calculate_contrast_ratio(light_text, background_color)
        dark_contrast = self.calculate_contrast_ratio(dark_text, background_color)

        return light_text if light_contrast > dark_contrast else dark_text

    def generate_hover_color(self, base_color: str, darken: bool = True) -> str:
        """Generate hover color (darker or lighter based on theme)"""
        try:
            hex_color = base_color.lstrip('#')
            rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

            hsv = colorsys.rgb_to_hsv(rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0)

            if darken:
                new_hsv = (hsv[0], hsv[1], max(0, hsv[2] - 0.15))
            else:
                new_hsv = (hsv[0], hsv[1], min(1, hsv[2] + 0.15))

            new_rgb = colorsys.hsv_to_rgb(*new_hsv)
            new_rgb = tuple(int(c * 255) for c in new_rgb)

            return f"#{new_rgb[0]:02x}{new_rgb[1]:02x}{new_rgb[2]:02x}"
        except:
            return base_color

    def validate_hex_color(self, color):
        """Validate and clean a hex color"""
        if not color or not isinstance(color, str):
            return "#000000"

        color = color.strip()
        if not color.startswith('#'):
            color = '#' + color

        if len(color) != 7:
            return "#000000"

        try:
            int(color[1:], 16)
            return color
        except ValueError:
            return "#000000"

    def is_light_color(self, hex_color: str) -> bool:
        """Check if a color is light (for text color replacement)"""
        try:
            hex_color = hex_color.lstrip('#')
            rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
            return luminance > 0.7
        except:
            return False

    def generate_gradient_css(self) -> str:
        """Generate CSS for header gradient based on current settings"""
        gradient_type = self.current_theme["visual_scheme"]["header_gradient_type"]

        if gradient_type == "none":
            return "background-image: none;"

        elif gradient_type == "solid":
            solid_color = self.current_theme["visual_scheme"]["header_gradient_solid_color"]
            return f"background-image: linear-gradient(to right, {solid_color}, {solid_color});"

        elif gradient_type == "preset":
            preset_name = self.current_theme["visual_scheme"]["header_gradient_preset"]
            if preset_name in self.gradient_presets:
                colors = self.gradient_presets[preset_name]
                colors_str = ", ".join(colors)
                return f"background-image: linear-gradient(to right, {colors_str});"
            else:
                return "background-image: none;"

        elif gradient_type == "custom":
            custom_colors = self.current_theme["visual_scheme"]["header_gradient_colors"]
            if custom_colors and len(custom_colors) > 0:
                valid_colors = [color for color in custom_colors if color and color.strip()]
                if valid_colors:
                    colors_str = ", ".join(valid_colors)
                    return f"background-image: linear-gradient(to right, {colors_str});"
            return "background-image: none;"

        return "background-image: none;"

    def setup_ui(self):
        """Create the main UI with proper scaling"""
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)

        title_label = tk.Label(main_frame,
                              text="🎨 Sim-Adversary Visual Theme Customizer",
                              font=("Arial", 16, "bold"),
                              bg='#2d3748', fg='white')
        title_label.pack(pady=(0, 10))

        subtitle_label = tk.Label(main_frame,
                                text="Customize header, gradients, backgrounds, alerts, and colors",
                                font=("Arial", 11),
                                bg='#2d3748', fg='#cbd5e0')
        subtitle_label.pack(pady=(0, 20))

        # Configure notebook to expand properly
        notebook = ttk.Notebook(main_frame)
        notebook.pack(fill="both", expand=True)

        # Create tabs with proper scaling
        presets_frame = ttk.Frame(notebook)
        notebook.add(presets_frame, text="🎯 Theme Presets")
        self.setup_presets_tab(presets_frame)

        visual_frame = ttk.Frame(notebook)
        notebook.add(visual_frame, text="🎨 Visual Scheme")
        self.setup_visual_tab(visual_frame)
        
        sidebar_frame = ttk.Frame(notebook)
        notebook.add(sidebar_frame, text="📋 Sidebar Theme")
        self.setup_sidebar_tab(sidebar_frame)

        dialog_frame = ttk.Frame(notebook)
        notebook.add(dialog_frame, text="⚠️ Alert/Dialog Theme")
        self.setup_dialog_tab(dialog_frame)

        gradient_frame = ttk.Frame(notebook)
        notebook.add(gradient_frame, text="🌈 Header Gradient")
        self.setup_gradient_tab(gradient_frame)

        interaction_frame = ttk.Frame(notebook)
        notebook.add(interaction_frame, text="🔘 Interaction colors")
        self.setup_interaction_tab(interaction_frame)

        files_frame = ttk.Frame(notebook)
        notebook.add(files_frame, text="📁 Files")
        self.setup_files_tab(files_frame)

        preview_frame = ttk.Frame(notebook)
        notebook.add(preview_frame, text="👁️ Preview")
        self.setup_preview_tab(preview_frame)

        contrast_frame = ttk.Frame(notebook)
        notebook.add(contrast_frame, text="🔍 Contrast Check")
        self.setup_contrast_tab(contrast_frame)

        self.setup_action_buttons(main_frame)
    
    def setup_dialog_tab(self, parent):
        """Setup the alert/dialog theme configuration tab with proper scaling"""
        # Main container for proper scaling
        main_container = ttk.Frame(parent)
        main_container.pack(fill="both", expand=True, padx=10, pady=10)
        
        canvas = tk.Canvas(main_container, bg='white')
        scrollbar = ttk.Scrollbar(main_container, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        # Add mouse wheel scrolling
        self.bind_mousewheel(canvas)

        # Instructions
        instructions_frame = ttk.LabelFrame(scrollable_frame, text="Alert & Dialog Customization", padding=20)
        instructions_frame.pack(fill="x", expand=True, padx=20, pady=10)  # Added expand=True
        
        instructions = tk.Label(instructions_frame,
                               text="Control the appearance of detection alerts, contingency dialogs, and warning banners.\n"
                                    "This ensures readability regardless of your main theme colors.",
                               font=("Arial", 10), wraplength=600, justify="left")
        instructions.pack(pady=(0, 10), anchor="w")

        # Dialog color categories
        dialog_categories = [
            ("Detection Dialogs", ["detection_bg", "detection_text", "detection_header_bg", "detection_header_text"]),
            ("Contingency Dialogs", ["contingency_bg", "contingency_text", "contingency_header_bg", "contingency_header_text"]),
            ("Warning Banners", ["warning_bg", "warning_text"]),
        ]

        if not hasattr(self, 'visual_buttons'):
            self.visual_buttons = {}

        for category_name, color_keys in dialog_categories:
            category_label = tk.Label(scrollable_frame,
                                    text=category_name,
                                    font=("Arial", 12, "bold"))
            category_label.pack(anchor="w", pady=(20, 5), padx=20)

            category_frame = ttk.Frame(scrollable_frame)
            category_frame.pack(fill="x", expand=True, padx=30)  # Added expand=True

            for color_key in color_keys:
                self.create_visual_color_picker(category_frame, color_key)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

    def setup_sidebar_tab(self, parent):
        """Setup the sidebar theme configuration tab with proper scaling"""
        # Main container for proper scaling
        main_container = ttk.Frame(parent)
        main_container.pack(fill="both", expand=True, padx=10, pady=10)
        
        canvas = tk.Canvas(main_container, bg='white')
        scrollbar = ttk.Scrollbar(main_container, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        # Add mouse wheel scrolling
        self.bind_mousewheel(canvas)

        # Instructions
        instructions_frame = ttk.LabelFrame(scrollable_frame, text="Sidebar Customization", padding=20)
        instructions_frame.pack(fill="x", expand=True, padx=20, pady=10)  # Added expand=True
        
        instructions = tk.Label(instructions_frame,
                               text="Control the appearance of the sidebar panels (Player Stats, Game Config, etc.).",
                               font=("Arial", 10), wraplength=400, justify="left")
        instructions.pack(pady=(0, 10), anchor="w")

        # Sidebar color categories
        sidebar_color_keys = ["sidebar_bg", "sidebar_text", "sidebar_header_bg", "sidebar_header_text"]
        
        if not hasattr(self, 'visual_buttons'):
            self.visual_buttons = {}

        for color_key in sidebar_color_keys:
            self.create_visual_color_picker(instructions_frame, color_key)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

    def bind_mousewheel(self, canvas):
        """Bind mouse wheel scrolling to canvas"""
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
        def _bind_to_mousewheel(event):
            canvas.bind_all("<MouseWheel>", _on_mousewheel)
        
        def _unbind_from_mousewheel(event):
            canvas.unbind_all("<MouseWheel>")
        
        canvas.bind('<Enter>', _bind_to_mousewheel)
        canvas.bind('<Leave>', _unbind_from_mousewheel)

    def on_canvas_configure(self, event):
        """Handle canvas resize events to update gradient preview"""
        # Small delay to ensure canvas is fully resized
        self.root.after(100, self.update_gradient_preview)

    def setup_gradient_tab(self, parent):
        """Setup header gradient customization tab with proper scaling"""
        # Use a regular frame instead of canvas for better scaling
        main_container = ttk.Frame(parent)
        main_container.pack(fill="both", expand=True, padx=10, pady=10)

        # Create canvas and scrollbar for scrolling content
        canvas = tk.Canvas(main_container, bg='white')
        scrollbar = ttk.Scrollbar(main_container, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        self.bind_mousewheel(canvas)

        # Gradient type selection
        type_frame = ttk.LabelFrame(scrollable_frame, text="Gradient Type", padding=20)
        type_frame.pack(fill="x", padx=20, pady=10)

        self.gradient_type_var = tk.StringVar(value=self.current_theme["visual_scheme"]["header_gradient_type"])

        type_options = [
            ("preset", "Use Preset Gradient", "Choose from predefined gradient styles"),
            ("custom", "Custom Gradient", "Create your own gradient with custom colors"),
            ("solid", "Solid color", "Use a single solid color for the gradient"),
            ("none", "No Gradient", "Remove the gradient entirely")
        ]

        for value, text, description in type_options:
            frame = ttk.Frame(type_frame)
            frame.pack(fill="x", pady=5)

            radio = tk.Radiobutton(frame, text=text, variable=self.gradient_type_var,
                                 value=value, command=self.on_gradient_type_change)
            radio.pack(anchor="w")

            desc_label = tk.Label(frame, text=description, font=("Arial", 9),
                                fg="gray", anchor="w")
            desc_label.pack(anchor="w", padx=20)

        # Preset gradients frame
        self.preset_frame = ttk.LabelFrame(scrollable_frame, text="Preset Gradients", padding=20)
        self.preset_frame.pack(fill="x", padx=20, pady=10)

        preset_label = tk.Label(self.preset_frame, text="Choose a preset gradient style:")
        preset_label.pack(anchor="w", pady=(0, 10))

        preset_grid_frame = ttk.Frame(self.preset_frame)
        preset_grid_frame.pack(fill="x", expand=True)

        self.preset_buttons = {}
        row = 0
        col = 0
        for preset_name, colors in self.gradient_presets.items():
            self.create_preset_gradient_button(preset_grid_frame, preset_name, colors, row, col)
            col += 1
            if col > 2:
                col = 0
                row += 1

        # Configure grid weights for proper scaling
        for i in range(3):
            preset_grid_frame.columnconfigure(i, weight=1)

        # Custom gradient frame
        self.custom_frame = ttk.LabelFrame(scrollable_frame, text="Custom Gradient colors", padding=20)
        self.custom_frame.pack(fill="x", padx=20, pady=10)

        custom_instruction = tk.Label(self.custom_frame,
                                    text="Create your custom gradient (2-9 colors). colors will blend from left to right:")
        custom_instruction.pack(anchor="w", pady=(0, 10))

        self.custom_color_frames = []
        self.custom_color_buttons = []
        self.custom_color_entries = []

        for i in range(9):
            self.create_custom_color_control(self.custom_frame, i)

        custom_button_frame = ttk.Frame(self.custom_frame)
        custom_button_frame.pack(fill="x", pady=(10, 0))

        add_color_btn = tk.Button(custom_button_frame, text="+ Add color",
                                command=self.add_custom_color)
        add_color_btn.pack(side="left", padx=(0, 5))

        remove_color_btn = tk.Button(custom_button_frame, text="- Remove color",
                                   command=self.remove_custom_color)
        remove_color_btn.pack(side="left", padx=5)

        reset_colors_btn = tk.Button(custom_button_frame, text="🔄 Reset to Rainbow",
                                   command=self.reset_custom_colors)
        reset_colors_btn.pack(side="left", padx=5)

        # Solid color frame
        self.solid_frame = ttk.LabelFrame(scrollable_frame, text="Solid color", padding=20)
        self.solid_frame.pack(fill="x", padx=20, pady=10)

        solid_instruction = tk.Label(self.solid_frame,
                                   text="Choose a solid color for the header gradient line:")
        solid_instruction.pack(anchor="w", pady=(0, 10))

        solid_color_frame = ttk.Frame(self.solid_frame)
        solid_color_frame.pack(fill="x")

        solid_color_label = tk.Label(solid_color_frame, text="Solid color:", width=15, anchor="w")
        solid_color_label.pack(side="left")

        self.solid_color_button = tk.Button(solid_color_frame,
                                          width=10, height=1,
                                          bg=self.current_theme["visual_scheme"]["header_gradient_solid_color"],
                                          command=self.pick_solid_color)
        self.solid_color_button.pack(side="left", padx=(5, 10))

        self.solid_color_var = tk.StringVar(value=self.current_theme["visual_scheme"]["header_gradient_solid_color"])
        solid_color_entry = tk.Entry(solid_color_frame, textvariable=self.solid_color_var, width=10)
        solid_color_entry.pack(side="left")
        solid_color_entry.bind("<KeyRelease>", self.on_solid_color_change)

        # Preview frame with proper scaling
        preview_frame = ttk.LabelFrame(scrollable_frame, text="Gradient Preview", padding=20)
        preview_frame.pack(fill="x", padx=20, pady=10)

        # Make preview canvas expand with window
        self.gradient_preview = tk.Canvas(preview_frame, height=30, bg="white")
        self.gradient_preview.pack(fill="x", expand=True, pady=10)

        preview_label = tk.Label(preview_frame, text="Note: This is a simplified preview. The actual gradient appears as a 4px line at the bottom of the header.")
        preview_label.pack(anchor="w")

        # Pack canvas and scrollbar with proper expansion
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Bind canvas resize event to update gradient preview
        canvas.bind("<Configure>", self.on_canvas_configure)

        self.update_gradient_ui_state()
        self.update_gradient_preview()

    def create_preset_gradient_button(self, parent, preset_name, colors, row, col):
        """Create a button showing a preset gradient with proper scaling"""
        frame = tk.Frame(parent, relief="raised", borderwidth=1, cursor="hand2")
        frame.grid(row=row, column=col, padx=5, pady=5, sticky="ew")

        title = tk.Label(frame, text=preset_name.title(), font=("Arial", 10, "bold"))
        title.pack(pady=2)

        # Make preview canvas expand horizontally
        preview_canvas = tk.Canvas(frame, height=20)
        preview_canvas.pack(fill="x", expand=True, pady=2)

        # Bind resize event to redraw gradient
        preview_canvas.bind("<Configure>", lambda e, c=preview_canvas, colors=colors: self.draw_gradient_preview(c, colors))

        def select_preset():
            self.current_theme["visual_scheme"]["header_gradient_preset"] = preset_name
            self.update_gradient_preview()
            if self.gradient_type_var.get() == "preset":
                self.highlight_selected_preset(preset_name)

        frame.bind("<Button-1>", lambda e: select_preset())
        title.bind("<Button-1>", lambda e: select_preset())
        preview_canvas.bind("<Button-1>", lambda e: select_preset())

        self.preset_buttons[preset_name] = frame
        return frame

    def draw_gradient_preview(self, canvas, colors):
        """Draw a gradient preview in a canvas"""
        canvas.delete("all")

        try:
            valid_colors = []
            for color in colors:
                if color and isinstance(color, str) and color.strip():
                    cleaned_color = color.strip()
                    if not cleaned_color.startswith('#'):
                        cleaned_color = '#' + cleaned_color
                    if len(cleaned_color) == 7 and all(c in '0123456789abcdefABCDEF' for c in cleaned_color[1:]):
                        valid_colors.append(cleaned_color)

            if not valid_colors:
                canvas.create_text(60, 10, text="No valid colors", font=("Arial", 8), fill="red")
                return

            width = canvas.winfo_reqwidth() or 120
            height = canvas.winfo_reqheight() or 20

            if len(valid_colors) < 2:
                canvas.create_rectangle(0, 0, width, height, fill=valid_colors[0], outline="")
                return

            segments = len(valid_colors) - 1
            segment_width = width / segments

            for i in range(segments):
                start_color = valid_colors[i]
                end_color = valid_colors[i + 1]

                for x in range(int(i * segment_width), int((i + 1) * segment_width)):
                    if segment_width > 0:
                        progress = (x - i * segment_width) / segment_width
                    else:
                        progress = 0
                    blended_color = self.blend_colors(start_color, end_color, progress)

                    if blended_color and len(blended_color) == 7 and blended_color.startswith('#'):
                        canvas.create_line(x, 0, x, height, fill=blended_color, width=1)
                    else:
                        canvas.create_line(x, 0, x, height, fill=start_color, width=1)

        except Exception as e:
            print(f"Error drawing gradient preview: {e}")
            canvas.create_text(60, 10, text="Preview Error", font=("Arial", 8), fill="red")

    def blend_colors(self, color1, color2, progress):
        """Blend two hex colors based on progress (0.0 to 1.0)"""
        try:
            color1 = color1.strip() if color1 else "#000000"
            color2 = color2.strip() if color2 else "#000000"

            if not color1.startswith('#'):
                color1 = '#' + color1
            if not color2.startswith('#'):
                color2 = '#' + color2

            if len(color1) != 7:
                color1 = "#000000"
            if len(color2) != 7:
                color2 = "#000000"

            r1, g1, b1 = tuple(int(color1[i:i+2], 16) for i in (1, 3, 5))
            r2, g2, b2 = tuple(int(color2[i:i+2], 16) for i in (1, 3, 5))

            progress = max(0.0, min(1.0, progress))

            r = max(0, min(255, int(r1 + (r2 - r1) * progress)))
            g = max(0, min(255, int(g1 + (g2 - g1) * progress)))
            b = max(0, min(255, int(b1 + (b2 - b1) * progress)))

            return f"#{r:02x}{g:02x}{b:02x}"
        except Exception as e:
            print(f"color blending error: {e}, color1='{color1}', color2='{color2}', progress={progress}")
            return color1 if color1 and len(color1) == 7 else "#000000"

    def create_custom_color_control(self, parent, index):
        """Create controls for one custom gradient color"""
        frame = ttk.Frame(parent)
        frame.pack(fill="x", pady=2)

        label = tk.Label(frame, text=f"color {index + 1}:", width=10, anchor="w")
        label.pack(side="left")

        current_colors = self.current_theme["visual_scheme"]["header_gradient_colors"]
        if index < len(current_colors):
            current_color = self.validate_hex_color(current_colors[index])
        else:
            current_color = "#ffffff"

        color_button = tk.Button(frame,
                               width=8, height=1,
                               bg=current_color,
                               command=lambda i=index: self.pick_custom_color(i))
        color_button.pack(side="left", padx=(5, 10))

        color_var = tk.StringVar(value=current_color)
        color_entry = tk.Entry(frame, textvariable=color_var, width=10)
        color_entry.pack(side="left")
        color_entry.bind("<KeyRelease>", lambda e, i=index: self.on_custom_color_change(i, color_var.get()))

        if index >= len(current_colors):
            frame.pack_forget()

        self.custom_color_frames.append(frame)
        self.custom_color_buttons.append(color_button)
        self.custom_color_entries.append(color_var)

    def highlight_selected_preset(self, preset_name):
        """Highlight the selected preset button"""
        if hasattr(self, 'preset_buttons'):
            try:
                for name, button in self.preset_buttons.items():
                    if name == preset_name:
                        button.configure(relief="sunken", borderwidth=3)
                    else:
                        button.configure(relief="raised", borderwidth=1)
            except Exception as e:
                print(f"Note: Could not highlight preset buttons: {e}")

    def on_gradient_type_change(self):
        """Handle gradient type change"""
        gradient_type = self.gradient_type_var.get()
        self.current_theme["visual_scheme"]["header_gradient_type"] = gradient_type
        self.update_gradient_ui_state()
        self.update_gradient_preview()

    def update_gradient_ui_state(self):
        """Update UI visibility based on gradient type"""
        gradient_type = self.gradient_type_var.get()

        try:
            self.preset_frame.pack_forget()
            self.custom_frame.pack_forget()
            self.solid_frame.pack_forget()
        except:
            pass

        if gradient_type == "preset":
            try:
                self.preset_frame.pack(fill="x", padx=20, pady=10)
                self.highlight_selected_preset(self.current_theme["visual_scheme"]["header_gradient_preset"])
            except:
                pass
        elif gradient_type == "custom":
            try:
                self.custom_frame.pack(fill="x", padx=20, pady=10)
            except:
                pass
        elif gradient_type == "solid":
            try:
                self.solid_frame.pack(fill="x", padx=20, pady=10)
            except:
                pass

    def pick_custom_color(self, index):
        """Pick a custom gradient color"""
        current_colors = self.current_theme["visual_scheme"]["header_gradient_colors"]
        current_color = self.validate_hex_color(current_colors[index] if index < len(current_colors) else "#ffffff")

        color = colorchooser.askcolor(color=current_color, title=f"Choose gradient color {index + 1}")

        if color[1]:
            validated_color = self.validate_hex_color(color[1])
            self.update_custom_color(index, validated_color)

    def update_custom_color(self, index, hex_color):
        """Update a custom gradient color"""
        hex_color = self.validate_hex_color(hex_color)

        current_colors = self.current_theme["visual_scheme"]["header_gradient_colors"]
        while len(current_colors) <= index:
            current_colors.append("#ffffff")

        current_colors[index] = hex_color

        try:
            self.custom_color_buttons[index].configure(bg=hex_color)
            self.custom_color_entries[index].set(hex_color)
        except Exception as e:
            print(f"Error updating custom color UI: {e}")

        self.update_gradient_preview()

    def on_custom_color_change(self, index, hex_value):
        """Handle manual hex entry for custom colors"""
        validated_color = self.validate_hex_color(hex_value)
        if validated_color != "#000000" or hex_value.lower() == "#000000":
            self.update_custom_color(index, validated_color)

    def add_custom_color(self):
        """Add another custom color"""
        current_colors = self.current_theme["visual_scheme"]["header_gradient_colors"]
        if len(current_colors) < 9:
            for i, frame in enumerate(self.custom_color_frames):
                if i == len(current_colors):
                    frame.pack(fill="x", pady=2)
                    current_colors.append("#ffffff")
                    break
            self.update_gradient_preview()

    def remove_custom_color(self):
        """Remove the last custom color"""
        current_colors = self.current_theme["visual_scheme"]["header_gradient_colors"]
        if len(current_colors) > 2:
            last_index = len(current_colors) - 1
            self.custom_color_frames[last_index].pack_forget()
            current_colors.pop()
            self.update_gradient_preview()

    def reset_custom_colors(self):
        """Reset custom colors to rainbow preset"""
        rainbow_colors = self.gradient_presets["rainbow"]
        self.current_theme["visual_scheme"]["header_gradient_colors"] = rainbow_colors.copy()

        for i, color in enumerate(rainbow_colors):
            if i < len(self.custom_color_buttons):
                self.custom_color_buttons[i].configure(bg=color)
                self.custom_color_entries[i].set(color)
                self.custom_color_frames[i].pack(fill="x", pady=2)

        for i in range(len(rainbow_colors), len(self.custom_color_frames)):
            self.custom_color_frames[i].pack_forget()

        self.update_gradient_preview()

    def pick_solid_color(self):
        """Pick solid gradient color"""
        current_color = self.validate_hex_color(self.current_theme["visual_scheme"]["header_gradient_solid_color"])
        color = colorchooser.askcolor(color=current_color, title="Choose solid gradient color")

        if color[1]:
            validated_color = self.validate_hex_color(color[1])
            self.current_theme["visual_scheme"]["header_gradient_solid_color"] = validated_color
            if hasattr(self, 'solid_color_button'):
                self.solid_color_button.configure(bg=validated_color)
            if hasattr(self, 'solid_color_var'):
                self.solid_color_var.set(validated_color)
            self.update_gradient_preview()

    def on_solid_color_change(self, event):
        """Handle manual hex entry for solid color"""
        if hasattr(self, 'solid_color_var'):
            hex_value = self.solid_color_var.get()
            validated_color = self.validate_hex_color(hex_value)
            if validated_color != "#000000" or hex_value.lower() == "#000000":
                self.current_theme["visual_scheme"]["header_gradient_solid_color"] = validated_color
                if hasattr(self, 'solid_color_button'):
                    self.solid_color_button.configure(bg=validated_color)
                self.update_gradient_preview()

    def update_gradient_preview(self):
        """Update the gradient preview canvas"""
        if not hasattr(self, 'gradient_preview'):
            return

        try:
            gradient_type = self.current_theme["visual_scheme"]["header_gradient_type"]

            self.gradient_preview.delete("all")
            
            # Get actual canvas dimensions instead of hardcoded values
            self.gradient_preview.update_idletasks()  # Ensure canvas is rendered
            width = self.gradient_preview.winfo_width()
            height = self.gradient_preview.winfo_height()
            
            # Fallback to reasonable defaults if canvas isn't ready
            if width <= 1:
                width = 600  # Increased from 400
            if height <= 1:
                height = 30

            if gradient_type == "none":
                self.gradient_preview.create_text(width//2, height//2, text="No Gradient",
                                                font=("Arial", 12), fill="gray")
            elif gradient_type == "solid":
                color = self.validate_hex_color(self.current_theme["visual_scheme"]["header_gradient_solid_color"])
                self.gradient_preview.create_rectangle(0, 0, width, height, fill=color, outline="")
            elif gradient_type == "preset":
                preset_name = self.current_theme["visual_scheme"]["header_gradient_preset"]
                if preset_name in self.gradient_presets:
                    colors = self.gradient_presets[preset_name]
                    self.draw_gradient_preview_full(self.gradient_preview, colors, width, height)
            elif gradient_type == "custom":
                colors = self.current_theme["visual_scheme"]["header_gradient_colors"]
                if colors and len(colors) > 0:
                    valid_colors = [c for c in colors if c and c.strip()]
                    if valid_colors:
                        self.draw_gradient_preview_full(self.gradient_preview, valid_colors, width, height)
        except Exception as e:
            print(f"Error updating gradient preview: {e}")

    def draw_gradient_preview(self, canvas, colors):
        """Draw a gradient preview in a canvas"""
        canvas.delete("all")

        try:
            valid_colors = []
            for color in colors:
                if color and isinstance(color, str) and color.strip():
                    cleaned_color = color.strip()
                    if not cleaned_color.startswith('#'):
                        cleaned_color = '#' + cleaned_color
                    if len(cleaned_color) == 7 and all(c in '0123456789abcdefABCDEF' for c in cleaned_color[1:]):
                        valid_colors.append(cleaned_color)

            if not valid_colors:
                canvas.create_text(60, 10, text="No valid colors", font=("Arial", 8), fill="red")
                return

            # Get actual canvas dimensions
            canvas.update_idletasks()
            width = canvas.winfo_width()
            height = canvas.winfo_height()
            
            # Fallback to canvas request size if not ready
            if width <= 1:
                width = canvas.winfo_reqwidth() or 120
            if height <= 1:
                height = canvas.winfo_reqheight() or 20

            if len(valid_colors) < 2:
                canvas.create_rectangle(0, 0, width, height, fill=valid_colors[0], outline="")
                return

            segments = len(valid_colors) - 1
            segment_width = width / segments

            for i in range(segments):
                start_color = valid_colors[i]
                end_color = valid_colors[i + 1]

                for x in range(int(i * segment_width), int((i + 1) * segment_width)):
                    if segment_width > 0:
                        progress = (x - i * segment_width) / segment_width
                    else:
                        progress = 0
                    blended_color = self.blend_colors(start_color, end_color, progress)

                    if blended_color and len(blended_color) == 7 and blended_color.startswith('#'):
                        canvas.create_line(x, 0, x, height, fill=blended_color, width=1)
                    else:
                        canvas.create_line(x, 0, x, height, fill=start_color, width=1)

        except Exception as e:
            print(f"Error drawing gradient preview: {e}")
            canvas.create_text(60, 10, text="Preview Error", font=("Arial", 8), fill="red")

    def draw_gradient_preview_full(self, canvas, colors, width, height):
        """Draw full-width gradient preview"""
        try:
            valid_colors = [self.validate_hex_color(color) for color in colors if color]
            valid_colors = [c for c in valid_colors if c != "#000000" or (colors and colors[0] == "#000000")]

            if len(valid_colors) < 2:
                if valid_colors:
                    canvas.create_rectangle(0, 0, width, height, fill=valid_colors[0], outline="")
                else:
                    canvas.create_text(width//2, height//2, text="No valid colors", font=("Arial", 10), fill="red")
                return

            segments = len(valid_colors) - 1
            segment_width = width / segments

            for i in range(segments):
                start_color = valid_colors[i]
                end_color = valid_colors[i + 1]

                for x in range(int(i * segment_width), int((i + 1) * segment_width)):
                    if segment_width > 0:
                        progress = (x - i * segment_width) / segment_width
                    else:
                        progress = 0
                    blended_color = self.blend_colors(start_color, end_color, progress)
                    canvas.create_line(x, 0, x, height, fill=blended_color, width=1)

        except Exception as e:
            print(f"Error in draw_gradient_preview_full: {e}")
            canvas.create_text(width//2, height//2, text="Preview Error", font=("Arial", 10), fill="red")

    def setup_presets_tab(self, parent):
        """Setup theme presets tab"""
        presets_frame = ttk.LabelFrame(parent, text="Choose a Base Theme", padding=20)
        presets_frame.pack(fill="both", expand=True, padx=20, pady=20)

        instructions = tk.Label(presets_frame,
                               text="Select a preset theme as your starting point, then customize in other tabs:",
                               font=("Arial", 11))
        instructions.pack(pady=(0, 20))

        preset_container = ttk.Frame(presets_frame)
        preset_container.pack(fill="both", expand=True)

        row = 0
        col = 0
        for preset_name, colors in self.theme_presets.items():
            preset_frame = self.create_preset_preview(preset_container, preset_name, colors)
            preset_frame.grid(row=row, column=col, padx=10, pady=10, sticky="nsew")

            col += 1
            if col > 2:
                col = 0
                row += 1

        for i in range(3):
            preset_container.columnconfigure(i, weight=1)
        for i in range(row + 1):
            preset_container.rowconfigure(i, weight=1)

    def create_preset_preview(self, parent, preset_name, colors):
        """Create a preview tile for a theme preset"""
        frame = tk.Frame(parent, relief="raised", borderwidth=2, cursor="hand2")

        title = tk.Label(frame, text=preset_name, font=("Arial", 11, "bold"))
        title.pack(pady=5)

        preview_frame = tk.Frame(frame, height=80)
        preview_frame.pack(fill="x", padx=10, pady=5)
        preview_frame.pack_propagate(False)

        header_strip = tk.Frame(preview_frame, bg=colors["header_primary"], height=15)
        header_strip.pack(fill="x")

        bg_demo = tk.Frame(preview_frame, bg=colors["page_background"])
        bg_demo.pack(fill="both", expand=True)

        container_demo = tk.Frame(bg_demo, bg=colors["container_background"], height=40)
        container_demo.pack(fill="x", padx=5, pady=5)

        text_sample = tk.Label(container_demo,
                              text="Sample Text",
                              bg=colors["container_background"],
                              fg=colors["text_primary"],
                              font=("Arial", 9))
        text_sample.pack()

        apply_btn = tk.Button(frame, text=f"Apply {preset_name}",
                             command=lambda p=preset_name: self.apply_preset(p))
        apply_btn.pack(pady=5)

        frame.bind("<Button-1>", lambda e, p=preset_name: self.apply_preset(p))

        return frame

    def apply_preset(self, preset_name):
        """Apply a theme preset"""
        if preset_name in self.theme_presets:
            preset_data = self.theme_presets[preset_name]
            
            # Apply visual scheme colors and interaction colors
            for key, value in preset_data.items():
                if key == "interaction_colors":
                    # Apply interaction colors if they exist
                    for int_key, int_value in value.items():
                        self.current_theme["interaction_colors"][int_key] = int_value
                elif key in self.current_theme["visual_scheme"]:
                    self.current_theme["visual_scheme"][key] = value

            self.current_theme["name"] = preset_name
            self.refresh_ui()

            messagebox.showinfo("Preset Applied",
                               f"✅ Applied '{preset_name}' theme preset!\n\n"
                               f"You can now fine-tune colors or generate your CSS.")
        else:
            messagebox.showerror("Error", f"Preset '{preset_name}' not found")

    def setup_visual_tab(self, parent):
        """Setup the visual scheme configuration tab with proper scaling"""
        # Main container for proper scaling
        main_container = ttk.Frame(parent)
        main_container.pack(fill="both", expand=True, padx=10, pady=10)
        
        canvas = tk.Canvas(main_container, bg='white')
        scrollbar = ttk.Scrollbar(main_container, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        # Add mouse wheel scrolling
        self.bind_mousewheel(canvas)

        visual_categories = [
            ("Header Theme", ["header_primary", "header_text"]),
            ("Background Theme", ["page_background", "container_background", "container_light"]),
            ("Text Theme", ["text_primary", "text_secondary"]),
            ("Header colors (H1-H6)", ["h1_color", "h2_color", "h3_color", "h4_color", "h5_color", "h6_color"]),
            ("Table Theme", ["table_header_bg", "table_header_text", "table_row_bg", "table_row_alt", "table_text", "table_border"]),
            ("Form Theme", ["input_bg", "input_border", "input_text", "input_placeholder", "input_focus_border", "form_label"]),
            ("Border Theme", ["border_color", "accent_border"]),
        ]

        if not hasattr(self, 'visual_buttons'):
            self.visual_buttons = {}

        for category_name, color_keys in visual_categories:
            category_label = tk.Label(scrollable_frame,
                                    text=category_name,
                                    font=("Arial", 12, "bold"))
            category_label.pack(anchor="w", pady=(20, 5), padx=20)

            category_frame = ttk.Frame(scrollable_frame)
            category_frame.pack(fill="x", expand=True, padx=20)  # Added expand=True

            for color_key in color_keys:
                self.create_visual_color_picker(category_frame, color_key)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

    def create_visual_color_picker(self, parent, color_key):
        """Create a color picker for visual scheme colors with proper scaling"""
        frame = ttk.Frame(parent)
        frame.pack(fill="x", expand=True, pady=2)  # Added expand=True

        descriptions = {
            "header_primary": "Header Background",
            "header_text": "Header Text",
            "page_background": "Main Page Background",
            "container_background": "Card/Form Backgrounds",
            "container_light": "Light Container Elements",
            "sidebar_bg": "Sidebar Panel BG",
            "sidebar_text": "Sidebar Panel Text",
            "sidebar_header_bg": "Sidebar Header BG",
            "sidebar_header_text": "Sidebar Header Text",
            "detection_bg": "Detection Dialog BG",
            "detection_text": "Detection Dialog Text",
            "detection_header_bg": "Detection Header BG", 
            "detection_header_text": "Detection Header Text",
            "contingency_bg": "Contingency Dialog BG",
            "contingency_text": "Contingency Dialog Text",
            "contingency_header_bg": "Contingency Header BG",
            "contingency_header_text": "Contingency Header Text",
            "warning_bg": "Warning Banner BG",
            "warning_text": "Warning Banner Text",
            "text_primary": "Primary Text color",
            "text_secondary": "Secondary/Muted Text",
            "h1_color": "H1 Header Text",
            "h2_color": "H2 Header Text",
            "h3_color": "H3 Header Text",
            "h4_color": "H4 Header Text",
            "h5_color": "H5 Header Text",
            "h6_color": "H6 Header Text",
            "table_header_bg": "Table Header Background",
            "table_header_text": "Table Header Text",
            "table_row_bg": "Table Row Background",
            "table_row_alt": "Alternate Table Row Background",
            "table_text": "Table Text color",
            "table_border": "Table Borders",
            "input_bg": "Input Field Background",
            "input_border": "Input Field Border",
            "input_text": "Input Field Text",
            "input_placeholder": "Input Placeholder Text",
            "input_focus_border": "Input Focus Border",
            "form_label": "Form Label Text",
            "border_color": "General Borders",
            "accent_border": "Sidebar/Section Borders"
        }

        label_text = descriptions.get(color_key, color_key.replace('_', ' ').title())
        label = tk.Label(frame, text=f"{label_text}:", width=25, anchor="w")
        label.pack(side="left")

        color_button = tk.Button(frame,
                               width=10, height=1,
                               bg=self.current_theme["visual_scheme"][color_key],
                               command=lambda key=color_key: self.pick_visual_color(key))
        color_button.pack(side="left", padx=(5, 10))

        hex_var = tk.StringVar(value=self.current_theme["visual_scheme"][color_key])
        hex_entry = tk.Entry(frame, textvariable=hex_var, width=10)
        hex_entry.pack(side="left")
        hex_entry.bind("<KeyRelease>", lambda e, key=color_key: self.on_visual_hex_change(key, hex_var.get()))

        if "text" in color_key or "color" in color_key:
            auto_btn = tk.Button(frame, text="Auto", font=("Arial", 8),
                               command=lambda key=color_key: self.auto_adjust_text(key))
            auto_btn.pack(side="left", padx=(5, 0))

        contrast_label = tk.Label(frame, text="", fg="red", font=("Arial", 8))
        contrast_label.pack(side="left", padx=(10, 0))

        self.visual_buttons[color_key] = {
            "button": color_button,
            "entry": hex_var,
            "contrast_label": contrast_label
        }

    def create_interaction_color_picker(self, parent, color_key):
        """Create color picker for interaction colors with proper scaling"""
        frame = ttk.Frame(parent)
        frame.pack(fill="x", expand=True, pady=2)  # Added expand=True

        label_text = color_key.replace('_', ' ').title()
        if "hover" in color_key:
            label_text += " (Auto-generated)"

        label = tk.Label(frame, text=f"{label_text}:", width=25, anchor="w")
        label.pack(side="left")

        color_button = tk.Button(frame,
                               width=10, height=1,
                               bg=self.current_theme["interaction_colors"][color_key],
                               command=lambda key=color_key: self.pick_interaction_color(key))
        color_button.pack(side="left", padx=(5, 10))

        hex_var = tk.StringVar(value=self.current_theme["interaction_colors"][color_key])
        hex_entry = tk.Entry(frame, textvariable=hex_var, width=10)
        hex_entry.pack(side="left")

        if "hover" in color_key:
            color_button.configure(state="disabled")
            hex_entry.configure(state="readonly")
        else:
            hex_entry.bind("<KeyRelease>", lambda e, key=color_key: self.on_interaction_hex_change(key, hex_var.get()))

        if not hasattr(self, 'interaction_buttons'):
            self.interaction_buttons = {}
            
        self.interaction_buttons[color_key] = {
            "button": color_button,
            "entry": hex_var
        }

    def pick_visual_color(self, color_key):
        """Open color picker for visual colors"""
        current_color = self.current_theme["visual_scheme"][color_key]
        color = colorchooser.askcolor(color=current_color, title=f"Choose {color_key} color")

        if color[1]:
            hex_color = color[1]
            self.update_visual_color(color_key, hex_color)

    def update_visual_color(self, color_key, hex_color):
        """Update visual color and check contrasts"""
        self.current_theme["visual_scheme"][color_key] = hex_color
        self.visual_buttons[color_key]["button"].configure(bg=hex_color)
        self.visual_buttons[color_key]["entry"].set(hex_color)

        self.update_visual_contrast_warnings()

    def on_visual_hex_change(self, color_key, hex_value):
        """Handle manual hex entry for visual colors"""
        if re.match(r'^#[0-9A-Fa-f]{6}$', hex_value):
            self.update_visual_color(color_key, hex_value)

    def auto_adjust_text(self, text_color_key):
        """Auto-adjust text color based on its typical background"""
        bg_key_map = {
            "header_text": "header_primary",
            "text_primary": "container_background",
            "text_secondary": "container_background",
            "sidebar_text": "sidebar_bg",
            "sidebar_header_text": "sidebar_header_bg",
            "detection_text": "detection_bg",
            "detection_header_text": "detection_header_bg",
            "contingency_text": "contingency_bg",
            "contingency_header_text": "contingency_header_bg",
            "warning_text": "warning_bg",
            "table_header_text": "table_header_bg",
            "table_text": "table_row_bg",
            "input_text": "input_bg",
            "input_placeholder": "input_bg",
            "form_label": "page_background"
        }
        # Default for H1-H6
        bg_color_key = next((bg_key_map[key] for key in bg_key_map if key == text_color_key), "page_background")

        bg_color = self.current_theme["visual_scheme"].get(bg_color_key, "#ffffff")
        optimal_text = self.auto_adjust_text_color(bg_color)
        self.update_visual_color(text_color_key, optimal_text)

    def update_visual_contrast_warnings(self):
        """Update contrast warnings for visual colors"""
        contrasts_to_check = [
            ("text_primary", "container_background", 4.5),
            ("text_secondary", "container_background", 3.0),
            ("header_text", "header_primary", 4.5),
            ("sidebar_text", "sidebar_bg", 4.5),
            ("sidebar_header_text", "sidebar_header_bg", 4.5),
            ("detection_text", "detection_bg", 4.5),
            ("detection_header_text", "detection_header_bg", 4.5),
            ("contingency_text", "contingency_bg", 4.5),
            ("contingency_header_text", "contingency_header_bg", 4.5),
            ("warning_text", "warning_bg", 4.5),
            ("h1_color", "page_background", 4.5),
            ("table_header_text", "table_header_bg", 4.5),
            ("table_text", "table_row_bg", 4.5),
            ("input_text", "input_bg", 4.5),
            ("input_placeholder", "input_bg", 3.0),
            ("form_label", "page_background", 4.5),
        ]

        for text_key, bg_key, min_ratio in contrasts_to_check:
            if text_key in self.visual_buttons and bg_key in self.current_theme["visual_scheme"]:
                text_color = self.current_theme["visual_scheme"][text_key]
                bg_color = self.current_theme["visual_scheme"][bg_key]
                contrast = self.calculate_contrast_ratio(text_color, bg_color)

                warning = ""
                if contrast < min_ratio:
                    warning = f"⚠️ {contrast:.1f}:1 (need {min_ratio}:1)"

                self.visual_buttons[text_key]["contrast_label"].configure(text=warning)

    def setup_interaction_tab(self, parent):
        """Setup interaction colors (buttons, states, etc.) with proper scaling"""
        # Main container for proper scaling
        main_container = ttk.Frame(parent)
        main_container.pack(fill="both", expand=True, padx=10, pady=10)
        
        canvas = tk.Canvas(main_container, bg='white')
        scrollbar = ttk.Scrollbar(main_container, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        # Add mouse wheel scrolling
        self.bind_mousewheel(canvas)

        instructions = tk.Label(scrollable_frame,
                               text="These colors are used for buttons, alerts, and interactive elements:",
                               font=("Arial", 11))
        instructions.pack(pady=(20, 20), padx=20)

        interaction_categories = [
            ("Primary Actions (Main Buttons)", ["primary", "primary_hover"]),
            ("Secondary Actions (Success, Continue)", ["secondary", "secondary_hover"]),
            ("Accent Actions (Events, Highlights)", ["accent", "accent_hover"]),
            ("Danger Actions (Errors, Delete)", ["danger", "danger_hover"]),
            ("Warning Actions (Cautions)", ["warning", "warning_hover"]),
        ]

        if not hasattr(self, 'interaction_buttons'):
            self.interaction_buttons = {}

        for category_name, color_keys in interaction_categories:
            category_label = tk.Label(scrollable_frame,
                                    text=category_name,
                                    font=("Arial", 12, "bold"))
            category_label.pack(anchor="w", pady=(20, 5), padx=20)

            category_frame = ttk.Frame(scrollable_frame)
            category_frame.pack(fill="x", expand=True, padx=20)  # Added expand=True

            for color_key in color_keys:
                self.create_interaction_color_picker(category_frame, color_key)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

    def create_interaction_color_picker(self, parent, color_key):
        """Create color picker for interaction colors"""
        frame = ttk.Frame(parent)
        frame.pack(fill="x", pady=2)

        label_text = color_key.replace('_', ' ').title()
        if "hover" in color_key:
            label_text += " (Auto-generated)"

        label = tk.Label(frame, text=f"{label_text}:", width=25, anchor="w")
        label.pack(side="left")

        color_button = tk.Button(frame,
                               width=10, height=1,
                               bg=self.current_theme["interaction_colors"][color_key],
                               command=lambda key=color_key: self.pick_interaction_color(key))
        color_button.pack(side="left", padx=(5, 10))

        hex_var = tk.StringVar(value=self.current_theme["interaction_colors"][color_key])
        hex_entry = tk.Entry(frame, textvariable=hex_var, width=10)
        hex_entry.pack(side="left")

        if "hover" in color_key:
            color_button.configure(state="disabled")
            hex_entry.configure(state="readonly")
        else:
            hex_entry.bind("<KeyRelease>", lambda e, key=color_key: self.on_interaction_hex_change(key, hex_var.get()))

        self.interaction_buttons[color_key] = {
            "button": color_button,
            "entry": hex_var
        }

    def pick_interaction_color(self, color_key):
        """Pick interaction color"""
        if "hover" in color_key:
            return

        current_color = self.current_theme["interaction_colors"][color_key]
        color = colorchooser.askcolor(color=current_color, title=f"Choose {color_key} color")

        if color[1]:
            self.update_interaction_color(color_key, color[1])

    def update_interaction_color(self, color_key, hex_color):
        """Update interaction color and auto-generate hover"""
        self.current_theme["interaction_colors"][color_key] = hex_color
        self.interaction_buttons[color_key]["button"].configure(bg=hex_color)
        self.interaction_buttons[color_key]["entry"].set(hex_color)

        if not "hover" in color_key:
            hover_key = color_key + "_hover"
            if hover_key in self.current_theme["interaction_colors"]:
                hover_color = self.generate_hover_color(hex_color)
                self.current_theme["interaction_colors"][hover_key] = hover_color
                self.interaction_buttons[hover_key]["button"].configure(bg=hover_color)
                self.interaction_buttons[hover_key]["entry"].set(hover_color)

    def on_interaction_hex_change(self, color_key, hex_value):
        """Handle interaction color hex changes"""
        if re.match(r'^#[0-9A-Fa-f]{6}$', hex_value):
            self.update_interaction_color(color_key, hex_value)

    def setup_files_tab(self, parent):
        """Setup files tab"""
        files_frame = ttk.LabelFrame(parent, text="File Configuration", padding=20)
        files_frame.pack(fill="both", expand=True, padx=20, pady=20)

        input_frame = ttk.Frame(files_frame)
        input_frame.pack(fill="x", pady=10)

        tk.Label(input_frame, text="Input CSS File:").pack(anchor="w")
        input_path_frame = ttk.Frame(input_frame)
        input_path_frame.pack(fill="x", pady=5)

        self.input_path_var = tk.StringVar()
        input_entry = tk.Entry(input_path_frame, textvariable=self.input_path_var, state="readonly")
        input_entry.pack(side="left", fill="x", expand=True)

        input_browse_btn = tk.Button(input_path_frame, text="Browse...",
                                   command=self.browse_input_file)
        input_browse_btn.pack(side="right", padx=(5, 0))

        output_frame = ttk.Frame(files_frame)
        output_frame.pack(fill="x", pady=10)

        tk.Label(output_frame, text="Output CSS File:").pack(anchor="w")
        output_path_frame = ttk.Frame(output_frame)
        output_path_frame.pack(fill="x", pady=5)

        self.output_path_var = tk.StringVar()
        output_entry = tk.Entry(output_path_frame, textvariable=self.output_path_var)
        output_entry.pack(side="left", fill="x", expand=True)

        output_browse_btn = tk.Button(output_path_frame, text="Browse...",
                                    command=self.browse_output_file)
        output_browse_btn.pack(side="right", padx=(5, 0))

        theme_frame = ttk.LabelFrame(files_frame, text="Theme Management", padding=10)
        theme_frame.pack(fill="x", pady=(20, 0))

        theme_buttons_frame = ttk.Frame(theme_frame)
        theme_buttons_frame.pack(fill="x")

        save_theme_btn = tk.Button(theme_buttons_frame, text="💾 Save Theme",
                                 command=self.save_theme)
        save_theme_btn.pack(side="left", padx=(0, 5))

        load_theme_btn = tk.Button(theme_buttons_frame, text="📂 Load Theme",
                                 command=self.load_theme)
        load_theme_btn.pack(side="left", padx=5)

        reset_theme_btn = tk.Button(theme_buttons_frame, text="🔄 Reset to Default",
                                  command=self.reset_theme)
        reset_theme_btn.pack(side="left", padx=5)

    def setup_preview_tab(self, parent):
        """Setup preview tab"""
        preview_frame = ttk.LabelFrame(parent, text="Theme Preview", padding=10)
        preview_frame.pack(fill="both", expand=True, padx=20, pady=20)

        self.preview_text = tk.Text(preview_frame, height=20, font=("Courier New", 10))
        preview_scrollbar = ttk.Scrollbar(preview_frame, orient="vertical", command=self.preview_text.yview)
        self.preview_text.configure(yscrollcommand=preview_scrollbar.set)

        self.preview_text.pack(side="left", fill="both", expand=True)
        preview_scrollbar.pack(side="right", fill="y")

        preview_btn = tk.Button(preview_frame, text="🔄 Generate Preview",
                              command=self.generate_preview)
        preview_btn.pack(pady=(10, 0))

    def setup_contrast_tab(self, parent):
        """Setup contrast checking tab"""
        contrast_frame = ttk.LabelFrame(parent, text="Accessibility Check", padding=20)
        contrast_frame.pack(fill="both", expand=True, padx=20, pady=20)

        instructions = tk.Label(contrast_frame,
                               text="Check contrast ratios for accessibility compliance (WCAG 2.1):",
                               font=("Arial", 11))
        instructions.pack(pady=(0, 20))

        self.contrast_results = tk.Text(contrast_frame, height=15, font=("Courier New", 10))
        contrast_scrollbar = ttk.Scrollbar(contrast_frame, orient="vertical", command=self.contrast_results.yview)
        self.contrast_results.configure(yscrollcommand=contrast_scrollbar.set)

        self.contrast_results.pack(side="left", fill="both", expand=True)
        contrast_scrollbar.pack(side="right", fill="y")

        check_btn = tk.Button(contrast_frame, text="🔍 Check All Contrasts",
                            command=self.check_all_contrasts)
        check_btn.pack(pady=(10, 0))

    def browse_input_file(self):
        """Browse for input CSS file"""
        file_path = filedialog.askopenfilename(
            title="Select CSS file to customize",
            filetypes=[("CSS files", "*.css"), ("All files", "*.*")]
        )
        if file_path:
            self.input_path_var.set(file_path)
            self.css_file_path = file_path

            if not self.output_path_var.get():
                base_name = Path(file_path).stem
                output_path = str(Path(file_path).parent / f"{base_name}_themed.css")
                self.output_path_var.set(output_path)

    def browse_output_file(self):
        """Browse for output CSS file"""
        file_path = filedialog.asksaveasfilename(
            title="Save themed CSS as...",
            filetypes=[("CSS files", "*.css"), ("All files", "*.*")],
            defaultextension=".css"
        )
        if file_path:
            self.output_path_var.set(file_path)
            self.output_file_path = file_path

    def save_theme(self):
        """Save current theme"""
        file_path = filedialog.asksaveasfilename(
            title="Save theme as...",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            defaultextension=".json"
        )
        if file_path:
            try:
                with open(file_path, 'w') as f:
                    json.dump(self.current_theme, f, indent=2)
                messagebox.showinfo("Success", f"Theme saved to {file_path}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save theme: {str(e)}")

    def load_theme(self):
        """Load theme from file"""
        file_path = filedialog.askopenfilename(
            title="Load theme from...",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if file_path:
            try:
                with open(file_path, 'r') as f:
                    loaded_theme = json.load(f)

                if "visual_scheme" in loaded_theme:
                    # Ensure new keys exist to prevent errors
                    default_scheme = self.__init__.__defaults__[0]['visual_scheme']
                    for key, value in default_scheme.items():
                        if key not in loaded_theme['visual_scheme']:
                            loaded_theme['visual_scheme'][key] = value

                    self.current_theme = loaded_theme
                    self.refresh_ui()
                    messagebox.showinfo("Success", f"Theme loaded from {file_path}")
                else:
                    messagebox.showerror("Error", "Invalid theme file format")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load theme: {str(e)}")

    def reset_theme(self):
        """Reset to default theme"""
        self.apply_preset("Default Dark")

    def generate_preview(self):
        """Generate CSS preview"""
        if not self.css_file_path:
            messagebox.showwarning("Warning", "Please select an input CSS file first")
            return

        try:
            themed_css = self.process_css_file(self.css_file_path)
            self.preview_text.delete(1.0, tk.END)
            lines = themed_css.split('\n')[:100]
            preview_content = '\n'.join(lines)
            if len(themed_css.split('\n')) > 100:
                preview_content += f"\n\n... (showing first 100 lines of {len(themed_css.split('\n'))} total lines)"
            self.preview_text.insert(1.0, preview_content)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate preview: {str(e)}")

    def check_all_contrasts(self):
        """Check all contrast ratios"""
        self.contrast_results.delete(1.0, tk.END)

        results = "ACCESSIBILITY CONTRAST ANALYSIS\n"
        results += "=" * 50 + "\n\n"

        contrast_checks = [
            ("Primary Text vs Container Background", "text_primary", "container_background", 4.5),
            ("Secondary Text vs Container Background", "text_secondary", "container_background", 3.0),
            ("Header Text vs Header Background", "header_text", "header_primary", 4.5),
            ("Sidebar Text vs Sidebar Background", "sidebar_text", "sidebar_bg", 4.5),
            ("Sidebar Header Text vs Sidebar Header BG", "sidebar_header_text", "sidebar_header_bg", 4.5),
            ("H1 Headers vs Page Background", "h1_color", "page_background", 4.5),
            ("Table Header Text vs Table Header Background", "table_header_text", "table_header_bg", 4.5),
            ("Table Text vs Table Row Background", "table_text", "table_row_bg", 4.5),
            ("Input Text vs Input Background", "input_text", "input_bg", 4.5),
        ]

        all_passed = True

        for description, text_key, bg_key, min_ratio in contrast_checks:
            text_color = self.current_theme["visual_scheme"][text_key]
            bg_color = self.current_theme["visual_scheme"][bg_key]
            contrast = self.calculate_contrast_ratio(text_color, bg_color)

            status = "✓ PASS" if contrast >= min_ratio else "✗ FAIL"
            if contrast < min_ratio:
                all_passed = False

            results += f"{description}:\n"
            results += f"  {text_color} on {bg_color}\n"
            results += f"  Contrast: {contrast:.2f}:1 (need {min_ratio}:1) {status}\n\n"

        results += f"\n{'✅ ALL CHECKS PASSED!' if all_passed else '⚠️ SOME CHECKS FAILED'}\n"
        self.contrast_results.insert(1.0, results)

    def process_css_file(self, input_file: str) -> str:
        """Process CSS file with theme colors and gradient settings including new dialog controls"""
        with open(input_file, 'r') as f:
            css_content = f.read()
        
        visual_scheme = self.current_theme["visual_scheme"]

        # Build a comprehensive mapping of old -> new colors
        color_mappings = {}
        color_mappings["#222"] = visual_scheme["page_background"]
        color_mappings["#444"] = visual_scheme["container_background"]
        color_mappings["#fff"] = visual_scheme["text_primary"]

        # Apply simple replacements (less reliable, but can work)
        for old_color, new_color in color_mappings.items():
            if old_color.lower() != new_color.lower():
                pattern = r'(?i)\b' + re.escape(old_color) + r'(?![\da-f])'
                css_content = re.sub(pattern, new_color, css_content)

        # Generate the CSS overrides, which is the more robust method
        gradient_css = self.generate_gradient_css()
        
        # Add !important overrides to ensure changes are applied
        overrides = f"""
/* --- THEME OVERRIDES (GENERATED) --- */

/* Body and General Layout */
body {{
    background-color: {visual_scheme["page_background"]} !important;
    color: {visual_scheme["text_primary"]} !important;
}}

/* Header */
header {{
    background-color: {visual_scheme["header_primary"]} !important;
    color: {visual_scheme["header_text"]} !important;
    {gradient_css}
}}

/* Header Text (H1-H6) */
h1 {{ color: {visual_scheme["h1_color"]} !important; }}
h2 {{ color: {visual_scheme["h2_color"]} !important; }}
h3 {{ color: {visual_scheme["h3_color"]} !important; }}
h4 {{ color: {visual_scheme["h4_color"]} !important; }}
h5 {{ color: {visual_scheme["h5_color"]} !important; }}
h6 {{ color: {visual_scheme["h6_color"]} !important; }}

/* Containers and Panels */
#stepContainer, .form-container, .game-info-panel, .stats-section, .path-section, .event-modal {{
    background: {visual_scheme["container_background"]} !important;
    color: {visual_scheme["text_primary"]} !important;
    border-color: {visual_scheme["border_color"]} !important;
}}

/* === SIDEBAR OVERRIDES === */
.sidebar-section, #inventory, #timer {{
    background: {visual_scheme["sidebar_bg"]} !important;
    color: {visual_scheme["sidebar_text"]} !important;
    border: 1px solid {visual_scheme["border_color"]} !important;
}}
.sidebar-header, #inventory h3 {{
    background: {visual_scheme["sidebar_header_bg"]} !important;
    color: {visual_scheme["sidebar_header_text"]} !important;
    border-bottom: 1px solid {visual_scheme["border_color"]} !important;
}}
.sidebar-section .stat-label, .sidebar-section .config-label,
.sidebar-section .stat-value, .sidebar-section .config-value,
#inventory-list li {{
    color: {visual_scheme["sidebar_text"]} !important;
    background: transparent !important;
    border-left: none !important;
}}
#inventory-list li {{
    border-bottom: 1px solid {visual_scheme["border_color"]} !important;
}}
#inventory-list li:last-child {{
     border-bottom: none !important;
}}
.sidebar-section .stat-item:hover, #inventory-list li:hover {{
    background-color: {visual_scheme["container_light"]} !important;
}}
.sidebar-header *, #inventory h3 * {{
    color: {visual_scheme["sidebar_header_text"]} !important;
}}
/* === END SIDEBAR OVERRIDES === */

/* === NEW: DETECTION & ALERT DIALOG OVERRIDES === */
.detection-dialog, .failure-dialog.exhausted {{
    background: {visual_scheme["detection_bg"]} !important;
    color: {visual_scheme["detection_text"]} !important;
    border-color: {visual_scheme["detection_bg"]} !important;
}}

.detection-header, .failure-dialog h3 {{
    background: {visual_scheme["detection_header_bg"]} !important;
    color: {visual_scheme["detection_header_text"]} !important;
}}

.detection-content, .detection-warning, .failure-dialog p, .failure-dialog span {{
    color: {visual_scheme["detection_text"]} !important;
}}

/* Force all text elements in detection dialogs to use white text */
.detection-dialog .contingency-count,
.detection-dialog .contingency-remaining,
.detection-dialog .cost-label,
.detection-dialog .cost-value,
.detection-dialog .contingency-count.high,
.detection-dialog .contingency-count.medium, 
.detection-dialog .contingency-count.low {{ 
    color: {visual_scheme["detection_text"]} !important;
}}

.detection-dialog .count-icon,
.detection-dialog .btn-icon {{
    filter: brightness(0) invert(1) !important; /* Makes icons white */
}}

/* Ensure detection warning text is readable */
.detection-dialog .detection-warning * {{
    color: {visual_scheme["detection_text"]} !important;
}}

.detection-dialog .detection-header,
.detection-dialog .detection-header *,
.detection-dialog h3,
.detection-dialog .header-icon + div,
.detection-dialog .detection-header div {{
    color: {visual_scheme["detection_header_text"]} !important;
}}

/* Force button text in detection dialogs to be white */
.detection-dialog .contingency-btn,
.detection-dialog .contingency-btn *,
.detection-dialog .alternative-btn,
.detection-dialog .alternative-btn *,
.detection-dialog .btn-text,
.detection-dialog .btn-cost,
.detection-dialog button {{
    color: {visual_scheme["detection_text"]} !important;
}}

/* Ensure any remaining text elements are white */
.detection-dialog .detection-actions *,
.detection-dialog .detection-content strong,
.detection-dialog span,
.detection-dialog div {{
    color: {visual_scheme["detection_text"]} !important;
}}

.contingency-dialog, .success-dialog {{
    background: {visual_scheme["contingency_bg"]} !important;
    color: {visual_scheme["contingency_text"]} !important;
    border-color: {visual_scheme["contingency_bg"]} !important;
}}

.contingency-header, .success-header {{
    background: {visual_scheme["contingency_header_bg"]} !important;
    color: {visual_scheme["contingency_header_text"]} !important;
}}

.contingency-content, .contingency-message, .success-content {{
    color: {visual_scheme["contingency_text"]} !important;
}}

.warning-banner {{
    background: {visual_scheme["warning_bg"]} !important;
    color: {visual_scheme["warning_text"]} !important;
    border-left-color: {visual_scheme["warning_bg"]} !important;
}}

.warning-banner h4, .warning-banner p, .warning-banner strong {{
    color: {visual_scheme["warning_text"]} !important;
}}

/* Override any failure dialog text colors to ensure readability */
.failure-dialog.exhausted *, .failure-dialog.normal *, 
.detection-dialog *, .contingency-dialog *, .success-dialog * {{
    color: inherit !important;
}}

.failure-dialog.exhausted .stats-box,
.detection-warning, .contingency-message {{
    background: rgba(0, 0, 0, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
}}
/* === END DETECTION & ALERT DIALOG OVERRIDES === */

/* Table Styling */
.stats-header, .past-paths-table th, .decision-path-table th, .game-summary-table th, .events-table th, .path-header,.event-analysis-section, .event-analysis-section h4, .events-section, .events-overview , .events-overview p, .event-timeline-table, .event-timeline-table th   {{
    background: {visual_scheme["table_header_bg"]} !important;
    color: {visual_scheme["table_header_text"]} !important;
    border-color: {visual_scheme["table_border"]} !important;
}}
.past-paths-table td, .decision-path-table td, .game-summary-table td, .events-table td, .event-timeline-table td {{
    background-color: {visual_scheme["table_row_bg"]} !important;
    color: {visual_scheme["table_text"]} !important;
    border-color: {visual_scheme["table_border"]} !important;
}}
.past-paths-table tr:nth-child(even) td, .decision-path-table tr:nth-child(even) td, .game-summary-table tr:nth-child(even) td, .event-timeline-table tr:nth-child(even) {{
    background-color: {visual_scheme["table_row_alt"]} !important;
}}
.past-paths-table *, .decision-path-table *, .game-summary-table * {{
     color: {visual_scheme["table_text"]} !important;
}}

/* Form Styling */
input, .input-field, textarea, select {{
    background-color: {visual_scheme["input_bg"]} !important;
    color: {visual_scheme["input_text"]} !important;
    border: 1px solid {visual_scheme["input_border"]} !important;
}}
input:focus, .input-field:focus, textarea:focus, select:focus {{
    border-color: {visual_scheme["input_focus_border"]} !important;
    outline: none !important;
}}
label, .form-label, .detection-dialog, .detection-header, .detection-content, .detection-warning  {{
    color: {visual_scheme["form_label"]} !important;
}}

.choice-btn.active {{
    background-color: {self.current_theme["interaction_colors"]["primary"]} !important;
    border-color: {self.current_theme["interaction_colors"]["primary"]} !important;
}}

.choice-btn.active:hover {{
    background-color: {self.current_theme["interaction_colors"]["primary_hover"]} !important;
    border-color: {self.current_theme["interaction_colors"]["primary_hover"]} !important;
}}

/* General Text Elements */
p, div, span, li, a {{
    color: inherit !important;
}}
.text-secondary {{
    color: {visual_scheme["text_secondary"]} !important;
}}
/* --- END THEME OVERRIDES --- */
"""

        header_comment = f"""/*
 * Sim-Adversary Game Engine - Custom Visual Theme
 * Generated by Visual Theme Customizer v3.3
 * Theme: {self.current_theme["name"]}
 *
 * SIDEBAR THEME:
 * Panel BG: {self.current_theme["visual_scheme"]["sidebar_bg"]}
 * Panel Text: {self.current_theme["visual_scheme"]["sidebar_text"]}
 * Header BG: {self.current_theme["visual_scheme"]["sidebar_header_bg"]}
 * Header Text: {self.current_theme["visual_scheme"]["sidebar_header_text"]}
 *
 * ALERT/DIALOG THEME:
 * Detection BG: {self.current_theme["visual_scheme"]["detection_bg"]}
 * Detection Text: {self.current_theme["visual_scheme"]["detection_text"]}
 * Contingency BG: {self.current_theme["visual_scheme"]["contingency_bg"]}
 * Contingency Text: {self.current_theme["visual_scheme"]["contingency_text"]}
 * Warning BG: {self.current_theme["visual_scheme"]["warning_bg"]}
 * Warning Text: {self.current_theme["visual_scheme"]["warning_text"]}
 */

"""
        return header_comment + css_content + "\n\n" + overrides

    def refresh_ui(self):
        """Refresh UI with current theme"""
        if hasattr(self, 'visual_buttons'):
            for color_key, widgets in self.visual_buttons.items():
                if color_key in self.current_theme["visual_scheme"]:
                    color_value = self.current_theme["visual_scheme"][color_key]
                    widgets["button"].configure(bg=color_value)
                    widgets["entry"].set(color_value)

        if hasattr(self, 'interaction_buttons'):
            for color_key, widgets in self.interaction_buttons.items():
                if color_key in self.current_theme["interaction_colors"]:
                    color_value = self.current_theme["interaction_colors"][color_key]
                    widgets["button"].configure(bg=color_value)
                    widgets["entry"].set(color_value)

        if hasattr(self, 'gradient_type_var') and hasattr(self, 'custom_color_buttons'):
            try:
                self.gradient_type_var.set(self.current_theme["visual_scheme"]["header_gradient_type"])
                self.update_gradient_ui_state()

                custom_colors = self.current_theme["visual_scheme"]["header_gradient_colors"]
                for i, color in enumerate(custom_colors):
                    if i < len(self.custom_color_buttons):
                        validated_color = self.validate_hex_color(color)
                        self.custom_color_buttons[i].configure(bg=validated_color)
                        self.custom_color_entries[i].set(validated_color)
                        self.custom_color_frames[i].pack(fill="x", pady=2)

                for i in range(len(custom_colors), len(self.custom_color_frames)):
                    self.custom_color_frames[i].pack_forget()

                solid_color = self.validate_hex_color(self.current_theme["visual_scheme"]["header_gradient_solid_color"])
                if hasattr(self, 'solid_color_button'):
                    self.solid_color_button.configure(bg=solid_color)
                    self.solid_color_var.set(solid_color)

                if self.current_theme["visual_scheme"]["header_gradient_type"] == "preset":
                    preset_name = self.current_theme["visual_scheme"]["header_gradient_preset"]
                    self.highlight_selected_preset(preset_name)

                self.update_gradient_preview()
            except Exception as e:
                print(f"Note: Gradient UI not initialized yet: {e}")

        if hasattr(self, 'visual_buttons'):
            self.update_visual_contrast_warnings()

    def get_gradient_description(self) -> str:
        """Get a description of the current gradient settings"""
        gradient_type = self.current_theme["visual_scheme"]["header_gradient_type"]

        if gradient_type == "none":
            return "Type: None - No gradient applied"
        elif gradient_type == "solid":
            color = self.current_theme["visual_scheme"]["header_gradient_solid_color"]
            return f"Type: Solid color - {color}"
        elif gradient_type == "preset":
            preset_name = self.current_theme["visual_scheme"]["header_gradient_preset"]
            return f"Type: Preset - {preset_name.title()}"
        elif gradient_type == "custom":
            colors = self.current_theme["visual_scheme"]["header_gradient_colors"]
            valid_colors = [c for c in colors if c and c.strip()]
            if valid_colors:
                colors_str = ", ".join(valid_colors[:5])
                if len(valid_colors) > 5:
                    colors_str += f" (and {len(valid_colors) - 5} more)"
                return f"Type: Custom - {colors_str}"
            else:
                return "Type: Custom - No colors defined"

        return "Type: Unknown"

    def setup_action_buttons(self, parent):
        """Setup action buttons"""
        button_frame = ttk.Frame(parent)
        button_frame.pack(fill="x", pady=(20, 0))

        generate_btn = tk.Button(button_frame,
                               text="🎨 Generate Themed CSS",
                               font=("Arial", 12, "bold"),
                               bg="#059669", fg="white",
                               padx=20, pady=10,
                               command=self.generate_css)
        generate_btn.pack(side="left", padx=(0, 10))

        validate_btn = tk.Button(button_frame,
                               text="✅ Check Accessibility",
                               command=self.quick_validate)
        validate_btn.pack(side="left", padx=(0, 10))

        help_btn = tk.Button(button_frame,
                           text="❓ Help",
                           command=self.show_help)
        help_btn.pack(side="right")

    def quick_validate(self):
        """Quick accessibility validation"""
        issues = []

        key_checks = [
            ("text_primary", "container_background", 4.5),
            ("header_text", "header_primary", 4.5),
            ("sidebar_text", "sidebar_bg", 4.5),
            ("sidebar_header_text", "sidebar_header_bg", 4.5),
            ("detection_text", "detection_bg", 4.5),
            ("contingency_text", "contingency_bg", 4.5),
            ("warning_text", "warning_bg", 4.5)
        ]

        for text_key, bg_key, min_ratio in key_checks:
            text_color = self.current_theme["visual_scheme"][text_key]
            bg_color = self.current_theme["visual_scheme"][bg_key]
            contrast = self.calculate_contrast_ratio(text_color, bg_color)

            if contrast < min_ratio:
                issues.append(f"FAIL: {text_key} vs {bg_key}: {contrast:.2f}:1 (need {min_ratio}:1)")

        if issues:
            messagebox.showwarning("Accessibility Issues",
                                 "Found contrast issues:\n\n" + "\n".join(issues))
        else:
            messagebox.showinfo("Accessibility Check", "✅ Key contrasts look good!")

    def generate_css(self):
        """Generate themed CSS"""
        if not hasattr(self, 'input_path_var') or not self.input_path_var.get():
            messagebox.showerror("Error", "Please select an input CSS file")
            return

        if not hasattr(self, 'output_path_var') or not self.output_path_var.get():
            messagebox.showerror("Error", "Please specify an output CSS file")
            return

        try:
            themed_css = self.process_css_file(self.input_path_var.get())

            with open(self.output_path_var.get(), 'w') as f:
                f.write(themed_css)

            messagebox.showinfo("Success",
                               f"✅ Themed CSS generated successfully!\n\n"
                               f"Output: {self.output_path_var.get()}\n\n"
                               f"🎉 Simply replace your CSS file and see the changes!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate CSS: {str(e)}")
            import traceback
            print("Full error:", traceback.format_exc())


    def show_help(self):
        """Show help dialog"""
        help_text = """
🎨 Sim-Adversary Visual Theme Customizer v3.3

NEW in v3.3:
• Added Alert/Dialog Theme tab for detection popups
• Separate controls for detection, contingency, and warning dialogs
• Improved contrast checking for all dialog elements
• White text override option for better readability in light themes

Usage:
1. Choose a base theme from the Presets tab
2. Customize colors in Visual Scheme, Sidebar, and Alert/Dialog tabs
3. Adjust header gradients if desired
4. Check accessibility with the Contrast Check tab
5. Generate your themed CSS file

The Alert/Dialog Theme tab specifically addresses your detection popup readability issue!
        """
        messagebox.showinfo("Help", help_text)

    def run(self):
        """Start the application"""
        self.root.mainloop()

def main():
    """Main entry point"""
    try:
        app = VisualThemeCustomizer()
        app.run()
    except Exception as e:
        print(f"Error starting application: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()