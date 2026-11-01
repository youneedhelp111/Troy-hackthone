# -*- coding: utf-8 -*-
"""Build the StudyPal 3-minute pitch deck (Troy Hackathon 2026).

Run:  python docs/build_pitch.py
Out:  docs/StudyPal-路演.pptx
No secrets are used or read by this script.
"""
from __future__ import annotations

import os
import shutil
import tempfile

import numpy as np
from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "StudyPal-路演.pptx")

# ---------------------------------------------------------------- palette
BG = RGBColor(0x0A, 0x0C, 0x10)
PANEL = RGBColor(0x12, 0x17, 0x1F)
PANEL2 = RGBColor(0x0E, 0x13, 0x1A)
BORDER = RGBColor(0x25, 0x2D, 0x39)
BORDER_SOFT = RGBColor(0x1C, 0x23, 0x2D)
TEXT = RGBColor(0xE8, 0xED, 0xF5)
MUTED = RGBColor(0x8B, 0x96, 0xA8)
DIM = RGBColor(0x5D, 0x67, 0x78)
MINT = RGBColor(0x6E, 0xE7, 0xB7)
BLUE = RGBColor(0x60, 0xA5, 0xFA)
AMBER = RGBColor(0xFB, 0xBF, 0x24)
RED = RGBColor(0xF8, 0x71, 0x71)
PURPLE = RGBColor(0xA7, 0x8B, 0xFA)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
MINT_DARK = RGBColor(0x12, 0x2A, 0x24)
BLUE_DARK = RGBColor(0x11, 0x1E, 0x30)

YAHEI = "Microsoft YaHei"
MONO = "Consolas"

TOTAL = 14


# ---------------------------------------------------------------- helpers
def set_ea(run, name: str) -> None:
    """Make Chinese glyphs use the same face as Latin."""
    rpr = run._r.get_or_add_rPr()
    ea = rpr.find(qn("a:ea"))
    if ea is None:
        ea = rpr.makeelement(qn("a:ea"), {})
        rpr.append(ea)
    ea.set("typeface", name)


def tb(slide, x, y, w, h, anchor=MSO_ANCHOR.TOP):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    return tf


def add_line(tf, first, runs, size=12, color=TEXT, bold=False,
             space_before=0, space_after=0, line=1.25,
             align=PP_ALIGN.LEFT, font=YAHEI):
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment = align
    p.space_before = Pt(space_before)
    p.space_after = Pt(space_after)
    p.line_spacing = line
    for item in runs:
        text, st = (item, {}) if isinstance(item, str) else item
        r = p.add_run()
        r.text = text
        f = r.font
        f.size = Pt(st.get("size", size))
        f.bold = st.get("bold", bold)
        f.italic = st.get("italic", False)
        f.color.rgb = st.get("color", color)
        f.name = st.get("font", font)
        set_ea(r, st.get("font", font))
        if st.get("spc"):
            r._r.get_or_add_rPr().set("spc", str(int(st["spc"])))
    return p


def simple(slide, x, y, w, h, text, size=12, color=TEXT, bold=False,
           align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, line=1.25,
           font=YAHEI, spc=None, italic=False):
    tf = tb(slide, x, y, w, h, anchor)
    parts = text.split("\n")
    for i, part in enumerate(parts):
        st = {"spc": spc, "italic": italic} if (spc or italic) else {}
        add_line(tf, i == 0, [(part, st)], size=size, color=color,
                 bold=bold, align=align, line=line, font=font)
    return tf


def shape(slide, kind, x, y, w, h, fill=None, line=None, line_w=0.75,
          radius=None, rotation=None):
    sh = slide.shapes.add_shape(kind, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid()
        sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line
        sh.line.width = Pt(line_w)
    if radius is not None:
        try:
            sh.adjustments[0] = radius
        except Exception:
            pass
    if rotation is not None:
        sh.rotation = rotation
    sh.shadow.inherit = False
    tf = sh.text_frame
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.word_wrap = True
    return sh


def panel(slide, x, y, w, h, fill=PANEL, line=BORDER, radius=0.055,
          line_w=0.75):
    return shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h,
                 fill=fill, line=line, line_w=line_w, radius=radius)


def chip(slide, x, y, w, h, text, color=MINT, fill=MINT_DARK,
         border=None, size=9, bold=True, radius=0.5):
    sh = shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h,
               fill=fill, line=border, radius=radius)
    tf = sh.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = text
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color
    r.font.name = YAHEI
    set_ea(r, YAHEI)
    return sh


def logo(slide, x, y, d):
    sh = shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, d, d,
               fill=WHITE, line=None, radius=0.28)
    sh.fill.gradient()
    sh.fill.gradient_angle = 45
    stops = sh.fill.gradient_stops
    stops[0].color.rgb = MINT
    stops[0].position = 0.0
    stops[1].color.rgb = BLUE
    stops[1].position = 1.0
    star = shape(slide, MSO_SHAPE.STAR_4_POINT, x + d * 0.21, y + d * 0.21,
                 d * 0.58, d * 0.58, fill=WHITE, line=None)
    return sh, star


def connector(slide, x1, y1, x2, y2, color=BORDER, width=1.0):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,
                                   Inches(x1), Inches(y1),
                                   Inches(x2), Inches(y2))
    c.line.color.rgb = color
    c.line.width = Pt(width)
    return c


def background(prs, glow_path):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    bg = slide.background
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG
    slide.shapes.add_picture(glow_path, 0, 0,
                             width=prs.slide_width, height=prs.slide_height)
    return slide


def header(slide, kicker, title, subtitle=None):
    dash = shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, 0.78, 0.585, 0.26, 0.055,
                 fill=MINT, line=None, radius=0.5)
    simple(slide, 1.16, 0.45, 10.8, 0.3, kicker, 9.5, MINT, bold=True, spc=180)
    simple(slide, 0.78, 0.76, 11.85, 0.62, title, 29, TEXT, bold=True, line=1.0)
    if subtitle:
        simple(slide, 0.78, 1.42, 11.6, 0.36, subtitle, 12.5, MUTED, line=1.2)


def footer(slide, num):
    shape(slide, MSO_SHAPE.RECTANGLE, 0.78, 7.03, 11.78, 0.012,
          fill=BORDER_SOFT, line=None)
    simple(slide, 0.78, 7.12, 6.0, 0.22, "StudyPal · Troy Hackathon 2026",
           8, DIM, spc=60)
    simple(slide, 10.9, 7.12, 1.66, 0.22, f"{num:02d} / {TOTAL}", 8, DIM,
           align=PP_ALIGN.RIGHT)


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def bullet_block(slide, x, y, w, items, size=10.5, color=MUTED,
                 accent=MINT, gap=7, line=1.3, bold_head=False):
    """items: list of str, or (head, body) tuples."""
    tf = tb(slide, x, y, w, 0.3 * len(items) + 0.2)
    for i, item in enumerate(items):
        if isinstance(item, tuple):
            head, body = item
            runs = [("•  ", {"color": accent, "size": size}),
                    (head, {"color": TEXT, "bold": True, "size": size}),
                    ("  " + body, {"color": color, "size": size})]
        else:
            runs = [("•  ", {"color": accent, "size": size}),
                    (item, {"color": color, "size": size})]
        add_line(tf, i == 0, runs, size=size, color=color,
                 space_after=gap, line=line)
    return tf


def image(slide, path, x, y, w, h, crop=None, frame=True):
    pic = slide.shapes.add_picture(path, Inches(x), Inches(y),
                                   width=Inches(w), height=Inches(h))
    if crop:
        l, t, r, b = crop
        pic.crop_left = l
        pic.crop_top = t
        pic.crop_right = r
        pic.crop_bottom = b
    if frame:
        shape(slide, MSO_SHAPE.RECTANGLE, x, y, w, h, fill=None,
              line=BORDER, line_w=0.75)
    return pic


# ---------------------------------------------------------------- backdrop
def make_glow(path: str, w=1920, h=1080):
    yy, xx = np.mgrid[0:h, 0:w]
    xn = xx / w
    yn = yy / h

    def g(cx, cy, sx, sy, strength):
        d = ((xn - cx) ** 2) / (2 * sx ** 2) + ((yn - cy) ** 2) / (2 * sy ** 2)
        return np.exp(-d) * strength

    layers = [
        (g(-0.02, -0.06, 0.46, 0.52, 0.20), (96, 165, 250)),
        (g(1.02, 1.04, 0.50, 0.58, 0.16), (110, 231, 183)),
        (g(0.86, -0.08, 0.34, 0.40, 0.07), (96, 165, 250)),
    ]
    a_sum = np.clip(sum(a for a, _ in layers), 0, 1)
    rgb = np.zeros((h, w, 3), dtype=np.float64)
    for a, c in layers:
        for i in range(3):
            rgb[:, :, i] += a * c[i]
    rgb = rgb / np.maximum(a_sum, 1e-6)[:, :, None]
    rgba = np.dstack([np.clip(rgb, 0, 255), a_sum * 255]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(path, optimize=True)


# ---------------------------------------------------------------- slides
def slide_cover(prs, glow, docs):
    s = background(prs, glow)

    logo(s, 0.86, 0.72, 0.62)
    simple(s, 1.62, 0.79, 4.0, 0.34, "StudyPal", 16.5, TEXT, bold=True)
    simple(s, 1.63, 1.1, 4.4, 0.24, "AI STUDY BUDDY", 8, MUTED, spc=260)

    chip(s, 9.05, 0.78, 2.85, 0.36, "TROY HACKATHON 2026", MUTED,
         fill=PANEL2, border=BORDER, size=8.5)
    simple(s, 9.05, 1.24, 3.5, 0.24, "方向 2 · Language Models · AI Study Pal",
           8.5, DIM)

    simple(s, 0.86, 2.22, 7.6, 0.32, "AI STUDY PAL / BUDDY", 10.5, MINT,
           bold=True, spc=220)
    tf = tb(s, 0.82, 2.55, 7.8, 1.15)
    add_line(tf, True, [("Study", {"color": TEXT}),
                        ("Pal", {"color": MINT})],
             size=68, bold=True, line=0.95)
    simple(s, 0.86, 3.72, 7.4, 0.55,
           "把课件变成会引用原文的\n私人助教", 29, TEXT, bold=True, line=1.2)
    shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.88, 4.92, 2.1, 0.035,
          fill=MINT, line=None, radius=0.5)
    simple(s, 0.86, 5.1, 7.2, 0.66,
           "不是帮你读材料，而是确保你真的学会了。\n每一句 AI 答案，都能点回原文页码。",
           15, RGBColor(0xB8, 0xC3, 0xD3), line=1.45)

    chip(s, 0.86, 6.28, 1.55, 0.36, "3 分钟现场演示", MINT, fill=MINT_DARK,
         border=None, size=9.5)
    simple(s, 2.55, 6.34, 5.0, 0.3, "Troy Hackathon 2026 · 方向 2", 9, DIM)

    # right: product preview card
    px, py, pw, ph = 8.62, 2.05, 4.05, 3.98
    panel(s, px, py, pw, ph, fill=RGBColor(0x10, 0x16, 0x1E), line=BORDER)
    simple(s, px + 0.24, py + 0.17, 3.3, 0.22,
           "PRODUCT PREVIEW · 示意", 7.5, DIM, spc=120)
    for i, c in enumerate([RED, AMBER, MINT]):
        shape(s, MSO_SHAPE.OVAL, px + 2.98 + i * 0.16, py + 0.19, 0.075, 0.075,
              fill=c, line=None)
    shape(s, MSO_SHAPE.RECTANGLE, px + 0.24, py + 0.5, pw - 0.48, 0.01,
          fill=BORDER_SOFT, line=None)

    simple(s, px + 0.24, py + 0.68, pw - 0.48, 0.5,
           "What are the four necessary\nconditions for deadlock?", 9.5,
           RGBColor(0xC5, 0xCF, 0xDD), line=1.3)
    simple(s, px + 0.24, py + 1.32, 2.0, 0.22, "StudyPal", 8.5, MINT, bold=True)
    simple(s, px + 1.05, py + 1.32, 2.6, 0.22,
           "基于《Operating Systems Midterm Notes》", 7.5, DIM)

    tf = tb(s, px + 0.24, py + 1.66, pw - 0.48, 0.8)
    add_line(tf, True, [
        ("死锁需要同时满足四个条件：\n互斥、占有并等待、不可抢占、循环等待 ", {"color": TEXT}),
        ("[1]", {"color": MINT, "bold": True}),
    ], size=10.5, line=1.45)

    src = panel(s, px + 0.24, py + 2.38, pw - 0.48, 0.72,
                fill=RGBColor(0x0C, 0x14, 0x1A), line=None, radius=0.09)
    shape(s, MSO_SHAPE.RECTANGLE, px + 0.24, py + 2.5, 0.035, 0.48,
          fill=MINT, line=None)
    simple(s, px + 0.4, py + 2.49, 3.4, 0.22,
           "Operating Systems Midterm Notes", 8.5, RGBColor(0xC5, 0xCF, 0xDD))
    simple(s, px + 0.4, py + 2.73, 3.4, 0.22,
           "p.3 · Mutual exclusion / Hold and wait …", 7.8, DIM)
    simple(s, px + 0.24, py + 3.28, pw - 0.48, 0.26,
           "点击 [1]  →  打开原文页码", 8.5, MINT, bold=True)

    notes(s, "开场一句话：StudyPal 只基于你上传的课件作答，每个结论都能点回原文，"
             "而且从问答一路闭环到「测出薄弱点、针对性复习」。三分钟走一遍。")


def slide_problem(prs, glow):
    s = background(prs, glow)
    header(s, "PROBLEM · 为什么还需要一个新工具",
           "AI 学习助手，卡在三个问题上",
           "把 PDF 丢进聊天框，并没有让学习真正发生。")

    cards = [
        ("01", "答案不可信", "模型会一本正经地编造。学生无法核对，\n更不敢直接用在作业和考试里。",
         "结果：学生要么照抄，要么干脆不用。", "幻觉", RED),
        ("02", "学过就忘", "「看懂了」不等于「记住了」。\n没有测试与复习，知识很快归零。",
         "结果：考前只能从零再学一遍。", "遗忘", AMBER),
        ("03", "不知道下一步", "错在哪、该补什么、时间怎么分配，\n全凭感觉。",
         "结果：复习变成从头翻书。", "无方向", BLUE),
    ]
    for i, (num, title, body, outcome, tag, accent) in enumerate(cards):
        x = 0.78 + i * 4.02
        panel(s, x, 1.98, 3.72, 3.5)
        simple(s, x + 0.3, 2.2, 0.8, 0.5, num, 26, accent, bold=True)
        simple(s, x + 0.3, 2.8, 3.1, 0.4, title, 19, TEXT, bold=True)
        simple(s, x + 0.3, 3.3, 3.12, 0.85, body, 11, MUTED, line=1.5)
        shape(s, MSO_SHAPE.RECTANGLE, x + 0.3, 4.08, 3.05, 0.008,
              fill=BORDER_SOFT, line=None)
        simple(s, x + 0.3, 4.24, 3.1, 0.3, outcome, 9, DIM, italic=True)
        chip(s, x + 0.3, 4.72, 0.95, 0.32, tag, accent, fill=PANEL2,
             border=BORDER_SOFT, size=8.5)

    shape(s, MSO_SHAPE.RECTANGLE, 0.8, 5.98, 0.045, 0.5, fill=MINT, line=None)
    simple(s, 1.02, 5.96, 8.6, 0.5,
           "工具停在「问答」，而学习需要闭环。", 17, TEXT, bold=True)
    simple(s, 9.4, 6.05, 3.2, 0.3,
           "三个问题 · 一个闭环", 10, DIM, align=PP_ALIGN.RIGHT)
    footer(s, 2)
    notes(s, "先立问题：答案不可信、学过就忘、不知道下一步。三者不是模型能力问题，"
             "而是产品形态问题——只有问答，没有验证与复习闭环。")


def slide_solution(prs, glow):
    s = background(prs, glow)
    header(s, "SOLUTION · 产品主张",
           "一个闭环：问答 → 测出薄弱点 → 针对性复习",
           "不是帮你读材料，而是确保你真的学会 —— 而且每一句答案都能查证。")

    steps = [
        ("1", "上传课件", "PDF / PPTX / DOCX / MD\n本地解析、切块、建索引", "→ 30 秒内可提问"),
        ("2", "带引用问答", "每个结论带 [n]\n点击回到原文页码", "→ 句句可核验"),
        ("3", "出题 + 闪卡", "自动生成测验与卡片\n作答即判分、自评即记录", "→ 薄弱点可见"),
        ("4", "画像 + 计划", "掌握度、薄弱点\n生成 3 小时学习计划", "→ 下一步明确"),
    ]
    for i, (num, title, body, out) in enumerate(steps):
        x = 0.78 + i * 3.02
        panel(s, x, 2.28, 2.62, 2.02)
        chip(s, x + 0.22, 2.46, 0.34, 0.34, num, MINT, fill=MINT_DARK,
             size=10, radius=0.3)
        simple(s, x + 0.66, 2.49, 1.8, 0.3, title, 13.5, TEXT, bold=True)
        simple(s, x + 0.22, 3.0, 2.2, 0.95, body, 9.8, MUTED, line=1.45)
        simple(s, x + 0.22, 3.74, 2.2, 0.25, out, 8.6, MINT)
        if i < 3:
            simple(s, x + 2.66, 3.05, 0.3, 0.35, "→", 17, MINT, bold=True)

    # loop back note
    loop = panel(s, 0.78, 4.6, 11.78, 0.52, fill=MINT_DARK, line=None, radius=0.5)
    simple(s, 1.0, 4.7, 11.3, 0.3,
           "↺  闭环：测出的薄弱点，自动成为下一轮练习与闪卡的优先输入",
           10.5, MINT, bold=True)

    principles = [
        ("只答材料里的", "不接外部知识"),
        ("找不到就说找不到", "明确拒答，不编造"),
        ("索引留在本机", "只有片段发给模型"),
    ]
    for i, (head, sub) in enumerate(principles):
        x = 0.8 + i * 3.95
        simple(s, x, 5.55, 0.24, 0.24, "◆", 7, MINT)
        tf = tb(s, x + 0.3, 5.48, 3.4, 0.6)
        add_line(tf, True, [(head, {"color": TEXT, "bold": True, "size": 11.5})],
                 size=11.5)
        add_line(tf, False, [(sub, {"color": DIM, "size": 9.5})], size=9.5,
                 space_before=2)

    simple(s, 0.78, 6.4, 11.7, 0.3,
           "从「读材料」到「知道自己哪里不会」，全部在一个网页里完成。",
           11, MUTED)
    footer(s, 3)
    notes(s, "核心一句话：StudyPal 负责「验证」和「闭环」。上传、问答、出题、闪卡、"
             "画像、计划六个动作共享同一套材料与掌握度数据。")


def slide_overview(prs, glow, docs):
    s = background(prs, glow)
    header(s, "PRODUCT · 五个模块",
           "一条完整链路，全部在一个网页里",
           "聊天只是入口；真正的差异在材料、测验、闪卡与画像之间共享的数据。")

    modules = [
        ("M", "Materials", "上传即索引，自动提取标题、摘要与主题标签", AMBER),
        ("C", "Chat", "只基于材料回答，句句带引用、可查页码", MINT),
        ("P", "Practice", "3–20 道单选，即时反馈与解析，交卷判分", BLUE),
        ("F", "Flashcards", "3D 翻转，自评「记住 / 没记住」写入掌握度", PURPLE),
        ("I", "Insights", "掌握度、薄弱点、近 7 天活动与学习计划", MINT),
    ]
    for i, (letter, name, desc, accent) in enumerate(modules):
        y = 1.92 + i * 0.96
        panel(s, 0.78, y, 3.28, 0.86, fill=PANEL, line=BORDER_SOFT, radius=0.09)
        sh = shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.94, y + 0.19, 0.46, 0.46,
                   fill=PANEL2, line=BORDER_SOFT, radius=0.22)
        tfb = sh.text_frame
        tfb.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tfb.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = letter
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = accent
        r.font.name = YAHEI
        simple(s, 1.54, y + 0.14, 2.4, 0.28, name, 12.5, TEXT, bold=True)
        simple(s, 1.54, y + 0.43, 2.42, 0.36, desc, 8.6, MUTED, line=1.25)

    gx, gy, gw, gh = 4.62, 1.9, 3.82, 2.3875
    gap = 0.18
    shots = [
        (docs["materials"], gx, gy, None),
        (docs["chat"], gx + gw + gap, gy, None),
        (docs["quiz"], gx, gy + gh + gap, None),
        (docs["insights"], gx + gw + gap, gy + gh + gap, (0.0, 0.083, 0.0, 0.083)),
    ]
    for path, x, y, crop in shots:
        image(s, path, x, y, gw, gh, crop=crop)

    footer(s, 4)
    notes(s, "五个模块不是五个 demo，共享文档、概念与掌握度。截图按 Materials、Chat、"
             "Practice、Insights 排列；Flashcards 在演示里用键盘翻卡。")


def slide_chat(prs, glow, docs):
    s = background(prs, glow)
    header(s, "CORE 01 · CHAT",
           "每一句结论，都能点回原文",
           "回答不是「看着像对」，而是可以被你当场核对。")

    image(s, docs["chat"], 0.78, 1.95, 6.15, 3.844)
    simple(s, 0.8, 5.9, 6.1, 0.24,
           "Chat · 建议问题由已上传材料的主题动态生成", 8, DIM)

    panel(s, 7.18, 1.95, 5.38, 4.18, fill=PANEL, line=BORDER)
    simple(s, 7.42, 2.12, 4.8, 0.26, "引用是怎么工作的", 12.5, TEXT, bold=True)
    chip(s, 11.6, 2.08, 0.72, 0.28, "RAG", MINT, fill=MINT_DARK, size=7.5)

    steps = [
        ("01", "检索", "Dense 余弦 + BM25，RRF 融合取最相关的 6 个片段"),
        ("02", "约束", "提示词只允许基于片段作答，逐句强制 [n] 角标"),
        ("03", "查证", "点击角标，打开文档名、页码与原文抽屉"),
    ]
    for i, (num, title, desc) in enumerate(steps):
        y = 2.52 + i * 0.63
        simple(s, 7.42, y, 0.34, 0.22, num, 8.5, MINT, bold=True)
        simple(s, 7.9, y - 0.02, 1.0, 0.24, title, 10.5, TEXT, bold=True)
        simple(s, 8.85, y - 0.01, 3.5, 0.46, desc, 8.8, MUTED, line=1.3)

    # mock answer
    panel(s, 7.42, 4.48, 4.9, 1.5, fill=PANEL2, line=BORDER_SOFT, radius=0.08)
    simple(s, 7.58, 4.58, 1.0, 0.2, "Q", 7.5, MINT, bold=True)
    simple(s, 7.78, 4.58, 3.6, 0.2,
           "死锁的四个必要条件是什么？", 8, MUTED)
    simple(s, 11.35, 4.58, 0.8, 0.2, "示意", 7, DIM, align=PP_ALIGN.RIGHT)
    tf = tb(s, 7.58, 4.86, 4.6, 0.52)
    add_line(tf, True, [
        ("互斥、占有并等待、不可抢占、循环等待 ", {"color": TEXT}),
        ("[1]", {"color": MINT, "bold": True}),
    ], size=9.5, line=1.35)
    simple(s, 7.58, 5.6, 3.2, 0.22,
           "Operating Systems Notes · p.3", 7.8, MUTED)
    simple(s, 10.15, 5.6, 2.0, 0.22, "点击查看原文 →", 7.8, MINT,
           bold=True, align=PP_ALIGN.RIGHT)

    panel(s, 0.78, 6.28, 11.78, 0.48, fill=MINT_DARK, line=None, radius=0.5)
    tf = tb(s, 1.0, 6.36, 11.3, 0.3)
    add_line(tf, True, [
        ("找不到，就说找不到：", {"color": MINT, "bold": True}),
        ("材料里没有的内容不编造，并建议你该补哪份材料。", {"color": TEXT}),
    ], size=10.5)

    footer(s, 5)
    notes(s, "演示重点不是回答多聪明，而是可核验：点 [1] 打开第 3 页；再问一个材料里"
             "没有的问题，它会明确说找不到。这是和通用聊天机器人最大的区别。")


def slide_practice(prs, glow, docs):
    s = background(prs, glow)
    header(s, "CORE 02 · PRACTICE + FLASHCARDS",
           "看懂不算会：出题、判分、主动回忆",
           "每次作答与自评，都会写回同一个概念掌握度。")

    image(s, docs["quiz"], 0.78, 1.95, 5.6, 3.5)
    simple(s, 0.8, 5.58, 5.5, 0.24,
           "Practice · 范围 / 题量 / 难度 / 只考薄弱点", 8, DIM)

    panel(s, 6.68, 1.95, 5.9, 2.12, fill=PANEL, line=BORDER)
    simple(s, 6.9, 2.1, 3.6, 0.28, "Practice · 从材料自动出题", 12.5, TEXT, bold=True)
    chip(s, 11.05, 2.06, 1.3, 0.3, "3–20 题", BLUE, fill=BLUE_DARK, size=8)
    bullet_block(s, 6.9, 2.5, 5.45, [
        "3–20 道单选，Easy / Medium / Hard",
        "作答即时反馈：对错 + 解析 + 来源页码",
        "交卷服务端判分，可只考薄弱概念",
        "结果页直接列出薄弱概念与错题解析",
    ], size=9.6, accent=BLUE, gap=7, line=1.28)

    panel(s, 6.68, 4.22, 5.9, 2.12, fill=PANEL, line=BORDER)
    simple(s, 6.9, 4.37, 3.9, 0.28, "Flashcards · 主动回忆", 12.5, TEXT, bold=True)
    chip(s, 11.05, 4.33, 1.3, 0.3, "4–30 张", PURPLE, fill=PANEL2, size=8)
    bullet_block(s, 6.9, 4.77, 5.45, [
        "4–30 张，3D 翻转；Space 翻面、← / → 自评",
        "「没记住 / 记住了」直接写入掌握度",
        "错过的概念，下一组卡优先出现",
        "复习记录持久化，随时再来一组",
    ], size=9.6, accent=PURPLE, gap=7, line=1.28)

    shape(s, MSO_SHAPE.RECTANGLE, 0.8, 6.42, 0.045, 0.36, fill=MINT, line=None)
    simple(s, 1.02, 6.42, 11.3, 0.3,
           "每道题、每张卡都能回到来源 —— 复习不是凭感觉。", 12, TEXT, bold=True)
    footer(s, 6)
    notes(s, "出题不是炫技，是测量：答错两题，薄弱概念立刻出现。闪卡用键盘操作，"
             "现场翻三张，自评结果同样进掌握度。")


def slide_insights(prs, glow, docs):
    s = background(prs, glow)
    header(s, "CORE 03 · INSIGHTS",
           "知道自己哪里不会，比刷题更重要",
           "掌握度不是感觉，是测验与闪卡累计出来的数字。")

    image(s, docs["insights"], 0.78, 1.9, 5.86, 4.395)
    simple(s, 0.8, 6.4, 5.8, 0.24,
           "Insights · 掌握度 / 薄弱点 / 近 7 天活动 / 学习计划", 8, DIM)

    items = [
        ("概念掌握度", "quiz 与闪卡共同计入，同一概念跨模块累计"),
        ("薄弱点", "低于 72% 自动进入 Focus next（截图中 17%）"),
        ("学习节奏", "近 7 天活动柱状图，断档一眼看见"),
        ("下一步", "一键生成 3 小时计划，落到具体概念"),
    ]
    y = 1.98
    for head, body in items:
        shape(s, MSO_SHAPE.OVAL, 6.95, y + 0.09, 0.09, 0.09, fill=MINT, line=None)
        simple(s, 7.2, y, 1.6, 0.26, head, 12, TEXT, bold=True)
        simple(s, 8.75, y + 0.02, 3.85, 0.5, body, 10.2, MUTED, line=1.35)
        y += 0.83

    panel(s, 6.95, 5.42, 5.6, 0.94, fill=MINT_DARK, line=None, radius=0.08)
    shape(s, MSO_SHAPE.RECTANGLE, 6.95, 5.55, 0.04, 0.68, fill=MINT, line=None)
    simple(s, 7.18, 5.55, 5.2, 0.66,
           "闭环在这里合上：\n测出的薄弱点，就是下一轮练习与闪卡的输入。",
           10.5, TEXT, bold=True, line=1.4)

    footer(s, 7)
    notes(s, "这是收尾的核心：掌握度条、薄弱点、七天活动，最后生成三小时计划。"
             "让评委看到「测出来」直接变成「下一步做什么」。")


def slide_architecture(prs, glow):
    s = background(prs, glow)
    header(s, "ARCHITECTURE",
           "检索在本地，生成在云端",
           "几千个 chunk 不需要向量数据库；一台笔记本就能跑完整演示。")

    cx = 6.665

    b = panel(s, 4.45, 1.82, 4.43, 0.74, fill=PANEL, line=BORDER, radius=0.1)
    simple(s, 4.65, 1.93, 3.6, 0.24, "Browser", 12, TEXT, bold=True)
    simple(s, 4.65, 2.16, 4.1, 0.28,
           "原生 HTML / CSS / JS · 无构建 · 无 CDN · fetch + SSE", 8.4, MUTED)

    connector(s, cx, 2.56, cx, 2.84, MINT, 1.2)
    f = panel(s, 4.45, 2.84, 4.43, 0.78, fill=MINT_DARK, line=RGBColor(0x2A, 0x5A, 0x4A), radius=0.1)
    simple(s, 4.65, 2.95, 3.6, 0.24, "FastAPI · 单进程", 12, TEXT, bold=True)
    simple(s, 4.65, 3.19, 4.0, 0.28,
           "路由 / 上传 / 后台索引 / SSE / 统计", 8.4, RGBColor(0xA9, 0xD8, 0xC8))

    # bus
    bus_y = 3.9
    connector(s, cx, 3.62, cx, bus_y, BORDER, 1.2)
    connector(s, 2.565, bus_y, 10.765, bus_y, BORDER, 1.2)
    boxes = [
        (0.79, "SQLite (WAL)", "documents · chunks · FTS5\nquizzes · cards · mastery\n向量以 float32 BLOB 存储", MINT),
        (4.89, "Ollama · 本机", "nomic-embed-text · 768d\n本地向量化，零成本\n未启动时自动退化为 BM25", BLUE),
        (8.99, "DeepSeek · 云端", "deepseek-flash · 1M ctx\n流式生成，不占本机 GPU\n只接收检索到的片段", PURPLE),
    ]
    for x, title, body, accent in boxes:
        connector(s, x + 1.775, bus_y, x + 1.775, 4.1, BORDER, 1.2)
        panel(s, x, 4.1, 3.55, 1.18, fill=PANEL, line=BORDER_SOFT, radius=0.08)
        shape(s, MSO_SHAPE.RECTANGLE, x, 4.24, 0.035, 0.46, fill=accent, line=None)
        simple(s, x + 0.17, 4.2, 3.2, 0.26, title, 10.5, TEXT, bold=True)
        simple(s, x + 0.17, 4.5, 3.25, 0.74, body, 8.6, MUTED, line=1.42)

    # pipeline
    panel(s, 0.78, 5.6, 11.78, 0.98, fill=PANEL2, line=BORDER_SOFT, radius=0.08)
    simple(s, 0.98, 5.7, 3.0, 0.22, "一次提问的数据流", 7.8, DIM, spc=100)
    tf = tb(s, 0.98, 5.96, 11.4, 0.42)
    parts = [
        ("问题", {"color": TEXT, "bold": True}),
        ("  →  ", {"color": DIM}),
        ("Dense 余弦 + BM25", {"color": MINT, "bold": True}),
        ("  →  ", {"color": DIM}),
        ("RRF 融合", {"color": MINT, "bold": True}),
        ("  →  ", {"color": DIM}),
        ("Top-6 片段", {"color": BLUE, "bold": True}),
        ("  →  ", {"color": DIM}),
        ("强制 [n] 引用", {"color": BLUE, "bold": True}),
        ("  →  ", {"color": DIM}),
        ("SSE 流式", {"color": TEXT, "bold": True}),
    ]
    add_line(tf, True, parts, size=10.5, line=1.2)

    simple(s, 0.8, 6.7, 11.6, 0.24,
           "材料与索引不出本机；云端只看到检索到的片段，而不是整份文件。",
           9, DIM)
    footer(s, 8)
    notes(s, "架构一句话：浏览器无构建，FastAPI 单进程，SQLite 管存储与 FTS5，"
             "Ollama 本地向量化，DeepSeek 云端生成。检索全程本地，只有 top-6 片段出网。")


def slide_stack(prs, glow):
    s = background(prs, glow)
    header(s, "STACK",
           "每一个选型，都是为了 6 小时能演示",
           "没有 Node、没有向量数据库、没有本地 GPU —— 只有一台笔记本。")

    cols = [(0.78, 1.5), (2.34, 3.55), (5.98, 6.55)]
    headers = ["层", "选型", "为什么"]
    for (x, w), h in zip(cols, headers):
        simple(s, x, 1.93, w, 0.24, h, 8.5, DIM, spc=120)
    shape(s, MSO_SHAPE.RECTANGLE, 0.78, 2.2, 11.75, 0.01, fill=BORDER, line=None)

    rows = [
        ("前端", "原生 HTML / CSS / JS 单页", "演示机没有 Node；零构建、零 CDN 依赖", AMBER),
        ("后端", "FastAPI + Uvicorn", "异步流式、类型校验、单文件启动", MINT),
        ("存储", "SQLite + FTS5", "单文件、零运维；CJK bigram 保证中文可检索", BLUE),
        ("向量", "Ollama nomic-embed-text", "本地、免费；DeepSeek 没有 embedding API", PURPLE),
        ("生成", "DeepSeek deepseek-flash", "云端推理、1M 上下文、不占本机 GPU", MINT),
        ("流式", "SSE", "首字延迟低，三分钟演示的观感更好", BLUE),
    ]
    y = 2.32
    for i, (layer, choice, why, accent) in enumerate(rows):
        if i % 2 == 0:
            shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.7, y - 0.05, 11.9, 0.66,
                  fill=PANEL2, line=None, radius=0.06)
        shape(s, MSO_SHAPE.RECTANGLE, 0.78, y + 0.13, 0.035, 0.3,
              fill=accent, line=None)
        simple(s, 0.95, y + 0.1, 1.35, 0.3, layer, 10, MUTED, bold=True)
        simple(s, 2.34, y + 0.08, 3.55, 0.3, choice, 11.2, TEXT, bold=True)
        simple(s, 5.98, y + 0.1, 6.35, 0.3, why, 10, MUTED)
        y += 0.69

    simple(s, 0.8, 6.55, 11.6, 0.26,
           "所有选择都指向同一件事：现场零安装、零等待、零翻车。", 9.5, DIM)
    footer(s, 9)
    notes(s, "选型不是追新，而是围绕「6 小时、本机、可演示」做减法。"
             "特别说明：DeepSeek 无 embedding API，所以向量走本地 Ollama。")


def slide_privacy(prs, glow):
    s = background(prs, glow)
    header(s, "PRIVACY & ENGINEERING",
           "能演示，也经得起追问",
           "把「不翻车」当成功能来做：隐私是设计，不是声明。")

    panel(s, 0.78, 1.95, 5.25, 4.32, fill=PANEL, line=BORDER)
    chip(s, 1.0, 2.12, 1.55, 0.3, "PRIVACY BY DESIGN", MINT, fill=MINT_DARK, size=7.5)
    simple(s, 1.0, 2.55, 4.8, 0.32, "本地优先", 15, TEXT, bold=True)
    bullet_block(s, 1.0, 3.02, 4.75, [
        "文件、切块、向量、索引全部留在本机",
        "只把检索到的片段发送给云端模型",
        "无账号、无追踪、无外部 CDN",
        "Ollama 未启动 → 自动退化为纯 BM25",
    ], size=9.8, gap=9, line=1.35)
    panel(s, 1.0, 4.62, 4.8, 1.42, fill=PANEL2, line=BORDER_SOFT, radius=0.08)
    simple(s, 1.18, 4.74, 2.0, 0.22, "数据边界", 7.8, DIM, spc=100)
    shape(s, MSO_SHAPE.OVAL, 1.19, 5.08, 0.09, 0.09, fill=MINT, line=None)
    simple(s, 1.4, 5.0, 4.2, 0.24,
           "本机：文件 · 切块 · 向量 · 索引", 9, TEXT)
    shape(s, MSO_SHAPE.OVAL, 1.19, 5.48, 0.09, 0.09, fill=BLUE, line=None)
    simple(s, 1.4, 5.4, 4.2, 0.24,
           "云端：仅检索命中的片段", 9, TEXT)
    simple(s, 1.18, 5.72, 4.4, 0.24,
           "材料不出本机，模型看不到整份文件。", 7.8, DIM)

    panel(s, 6.35, 1.95, 6.2, 4.32, fill=PANEL, line=BORDER)
    simple(s, 6.57, 2.12, 5.4, 0.3, "为「不翻车」写的工程细节", 13, TEXT, bold=True)
    items = [
        ("后台索引", "上传秒回，状态 processing → ready / failed"),
        ("JSON 修复重试", "解析失败先修补，再降级重新生成"),
        ("相似度截断", "低于 top×0.75 的召回丢弃，防跨文档串题"),
        ("扫描件检测", "无文字层明确报错，不假装成功"),
        ("追问改写", "「那它的缺点呢？」也能命中上下文"),
    ]
    y = 2.58
    for head, body in items:
        simple(s, 6.57, y, 1.5, 0.24, head, 9.6, MINT, bold=True)
        simple(s, 8.08, y, 4.25, 0.28, body, 9.2, MUTED)
        y += 0.68

    panel(s, 0.78, 6.44, 11.78, 0.34, fill=PANEL2, line=None, radius=0.5)
    simple(s, 1.0, 6.49, 11.3, 0.24,
           "当前边界：不做 OCR、不做多用户、无鉴权 —— 面向本机学习场景，边界写进 README。",
           8.8, DIM)
    footer(s, 10)
    notes(s, "主动讲边界最加分：本地优先、只发片段、无账号；工程上做了后台索引、"
             "JSON 修复、相似度截断，都是为了现场稳定。")


def slide_scoring(prs, glow):
    s = background(prs, glow)
    header(s, "WHY IT SCORES",
           "评分表上的每一栏，都有对应实现",
           "不是堆功能，而是每条评分项都有可现场验证的落点。")

    rows = [
        ("Innovation & Creativity", "20%", "可核验引用 + 掌握度闭环 + 本地优先架构", MINT),
        ("Technical Excellence", "20%", "Dense + BM25 + RRF、SSE、JSON 修复重试、后台索引", BLUE),
        ("Functionality & Completeness", "20%", "上传 → 问答 → 出题 → 判分 → 闪卡 → 画像 → 计划全部可用", MINT),
        ("Impact & Usefulness", "15%", "解决「答案不可信」与「不知道复习什么」两个真问题", AMBER),
        ("Teamwork & Collaboration", "15%", "前后端解耦 + 完整文档，模块可并行开发", BLUE),
        ("Presentation & Pitch", "10%", "3 分钟脚本 + 真实截图 + 现场可操作", PURPLE),
    ]
    for (x, w), h in zip([(0.78, 3.4), (4.28, 1.0), (5.42, 7.0)],
                         ["评分项", "权重", "对应实现"]):
        simple(s, x, 1.93, w, 0.22, h, 8.5, DIM, spc=120)
    shape(s, MSO_SHAPE.RECTANGLE, 0.78, 2.2, 11.68, 0.01, fill=BORDER, line=None)

    y = 2.34
    for i, (name, weight, impl, accent) in enumerate(rows):
        if i % 2 == 0:
            shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.7, y - 0.04, 11.86, 0.6,
                  fill=PANEL2, line=None, radius=0.06)
        simple(s, 0.82, y + 0.06, 3.3, 0.3, name, 10.2, TEXT, bold=True)
        simple(s, 4.28, y + 0.05, 0.9, 0.3, weight, 12, accent, bold=True)
        simple(s, 5.42, y + 0.07, 6.9, 0.3, impl, 9.6, MUTED)
        y += 0.62

    shape(s, MSO_SHAPE.RECTANGLE, 0.8, 6.24, 0.045, 0.42, fill=MINT, line=None)
    tf = tb(s, 1.02, 6.26, 11.3, 0.4)
    add_line(tf, True, [
        ("能讲清楚，也能当场跑通", {"color": TEXT, "bold": True, "size": 12.5}),
        ("  —— 这是我们对「完成」的定义。", {"color": MUTED, "size": 11}),
    ], size=12.5)
    footer(s, 11)
    notes(s, "评审最关心「是不是真的做完了」。逐项对应，并强调每一项都能点开验证，"
             "不是 PPT 上的形容词。")


def slide_demo(prs, glow):
    s = background(prs, glow)
    header(s, "LIVE DEMO · 3 MIN",
           "三分钟，走完一次完整学习闭环",
           "现场操作，不用视频；每一步都有可见的状态变化。")

    steps = [
        ("0:00", "Materials", "拖入 OS 课件，30 秒完成解析、分块、本地索引", AMBER),
        ("0:30", "Chat", "问死锁四个必要条件，流式回答，点 [1] 打开第 3 页", MINT),
        ("1:00", "Chat", "问材料里没有的问题，明确回答「找不到」", MINT),
        ("1:20", "Practice", "生成 5 题 Medium，故意答错 2 题，看薄弱概念", BLUE),
        ("2:10", "Flashcards", "生成 8 张卡，Space 翻面、→ 标记记住", PURPLE),
        ("2:40", "Insights", "掌握度更新，生成 3 小时学习计划收尾", MINT),
    ]
    shape(s, MSO_SHAPE.RECTANGLE, 1.86, 2.0, 0.012, 4.36,
          fill=BORDER, line=None)
    y = 1.92
    for i, (time, name, desc, accent) in enumerate(steps):
        cy = y + 0.26
        shape(s, MSO_SHAPE.OVAL, 1.79, cy - 0.055, 0.15, 0.15,
              fill=accent, line=BG, line_w=2)
        simple(s, 0.78, cy - 0.12, 0.95, 0.24, time, 9.5, accent, bold=True,
               align=PP_ALIGN.RIGHT, font=MONO)
        tf = tb(s, 2.12, y + 0.02, 7.55, 0.55)
        add_line(tf, True, [
            (name + "  ", {"color": TEXT, "bold": True, "size": 11.5}),
            (desc, {"color": MUTED, "size": 10}),
        ], size=10.5, line=1.3)
        y += 0.73

    panel(s, 9.95, 1.95, 2.6, 4.2, fill=PANEL, line=BORDER)
    simple(s, 10.15, 2.12, 2.1, 0.26, "演示准备", 11.5, TEXT, bold=True)
    prep = ["两份真实课件已内置", "备份录屏，防现场断网", "断网仍可检索，仅生成需联网",
            "引用抽屉提前走一遍"]
    yy = 2.56
    for item in prep:
        simple(s, 10.15, yy, 0.2, 0.22, "✓", 9, MINT, bold=True)
        simple(s, 10.4, yy, 1.98, 0.5, item, 8.4, MUTED, line=1.3)
        yy += 0.62
    simple(s, 10.15, 5.08, 2.15, 0.24,
           "127.0.0.1:8000", 8, MINT, font=MONO)
    simple(s, 10.15, 5.55, 2.15, 0.4,
           "3:00 收尾：\n把计划停在屏幕上。", 8, DIM, line=1.35)

    panel(s, 0.78, 6.36, 11.78, 0.42, fill=MINT_DARK, line=None, radius=0.5)
    simple(s, 1.0, 6.44, 11.3, 0.26,
           "收尾台词：从读材料到知道自己哪里不会，整个闭环都在一个页面里。",
           9.8, MINT, bold=True)
    footer(s, 12)
    notes(s, "严格按时间走：30 秒材料，30 秒引用，20 秒拒答，50 秒测验，30 秒闪卡，"
             "20 秒画像与计划。每一步留一个可看的 UI 状态。")


def slide_roadmap(prs, glow):
    s = background(prs, glow)
    header(s, "ROADMAP",
           "从「能演示」到「每天能用」",
           "先做深一条链路，再扩展场景；边界清晰，路线才可信。")

    cols = [
        ("NOW · 已完成", "今天就能演示", MINT, [
            "带引用问答 + 来源抽屉",
            "自动出题、判分、掌握度",
            "闪卡与复习记录",
            "Insights 画像 + 3 小时计划",
            "本地混合检索",
        ]),
        ("NEXT · 3 个月", "把学习闭环做深", BLUE, [
            "扫描件 OCR / 手写笔记",
            "SM-2 间隔重复 + 错题重练",
            "中文 embedding（bge-m3）",
            "导出复习包",
            "按文档筛选卡组",
        ]),
        ("LATER · 一学期", "从个人工具到课程工具", PURPLE, [
            "多用户 + 课程空间",
            "Canvas LMS 集成",
            "移动端 + 离线同步",
            "考试成绩风险预测",
        ]),
    ]
    for i, (label, sub, accent, items) in enumerate(cols):
        x = 0.78 + i * 4.0
        panel(s, x, 1.98, 3.72, 4.18, fill=PANEL, line=BORDER)
        shape(s, MSO_SHAPE.RECTANGLE, x, 2.18, 0.035, 0.5, fill=accent, line=None)
        simple(s, x + 0.24, 2.16, 3.2, 0.22, label, 8.5, accent, bold=True, spc=120)
        simple(s, x + 0.24, 2.42, 3.2, 0.28, sub, 12.5, TEXT, bold=True)
        shape(s, MSO_SHAPE.RECTANGLE, x + 0.24, 2.86, 3.24, 0.01,
              fill=BORDER_SOFT, line=None)
        yy = 3.02
        for item in items:
            simple(s, x + 0.24, yy, 0.22, 0.22, "·", 11, accent, bold=True)
            simple(s, x + 0.44, yy - 0.01, 3.0, 0.44, item, 9.6, MUTED, line=1.3)
            yy += 0.55

    simple(s, 0.8, 6.42, 11.6, 0.26,
           "当前边界：只对上传材料作答；扫描版 PDF 需先 OCR；单用户、本机运行。",
           9, DIM)
    footer(s, 13)
    notes(s, "Roadmap 分三档，避免「什么都想做」。近期最值得做的是 OCR 与 SM-2，"
             "它们直接补强「材料接入」与「复习闭环」。")


def slide_thanks(prs, glow):
    s = background(prs, glow)
    logo(s, 0.9, 0.8, 0.66)
    simple(s, 1.7, 0.88, 4.0, 0.34, "StudyPal", 17, TEXT, bold=True)
    simple(s, 1.71, 1.2, 4.2, 0.24, "AI STUDY BUDDY", 8, MUTED, spc=260)

    simple(s, 0.86, 2.0, 5.0, 1.1, "谢谢", 66, TEXT, bold=True, line=1.0)
    simple(s, 0.9, 3.05, 3.0, 0.34, "Q & A", 16, MINT, bold=True, spc=300)
    simple(s, 0.9, 3.62, 6.8, 0.66,
           "不是帮你读，而是确保你真的学会了。\n每一句答案，都有出处。", 16, MUTED, line=1.5)

    panel(s, 0.9, 4.72, 7.2, 0.64, fill=PANEL, line=BORDER, radius=0.18)
    simple(s, 1.1, 4.87, 0.5, 0.24, "↗", 12, MINT, bold=True)
    simple(s, 1.5, 4.84, 6.5, 0.3,
           "github.com/youneedhelp111/Troy-hackthone", 12, TEXT, font=MONO)

    chips = [("现场可演示", MINT, MINT_DARK),
             ("方向 2 · Language Models", BLUE, BLUE_DARK),
             ("Troy Hackathon 2026", PURPLE, PANEL)]
    x = 0.9
    widths = [1.35, 3.05, 2.3]
    for (text, color, fill), w in zip(chips, widths):
        chip(s, x, 5.85, w, 0.36, text, color, fill=fill, border=BORDER_SOFT, size=8.8)
        x += w + 0.18

    # citation badge motif
    cx, cy, d = 10.55, 3.55, 2.95
    shape(s, MSO_SHAPE.OVAL, cx - d / 2, cy - d / 2, d, d, fill=None,
          line=BORDER, line_w=1.0)
    shape(s, MSO_SHAPE.OVAL, cx - d / 2 + 0.28, cy - d / 2 + 0.28, d - 0.56, d - 0.56,
          fill=None, line=RGBColor(0x2C, 0x3A, 0x46), line_w=0.75)
    simple(s, cx - 0.62, cy - 0.62, 1.24, 0.9, "[1]", 44, MINT, bold=True,
           align=PP_ALIGN.CENTER)
    simple(s, cx - 0.9, cy + 0.3, 1.8, 0.26, "p.3 · verified", 9, MUTED,
           align=PP_ALIGN.CENTER, spc=80)
    shape(s, MSO_SHAPE.OVAL, cx + d / 2 - 0.18, cy - 0.1, 0.11, 0.11,
          fill=BLUE, line=None)

    footer(s, 14)
    notes(s, "最后一页停住：仓库地址、Q&A。收尾再重复一次定位——不是帮你读，"
             "而是确保你真的学会，而且每一句都能查证。")


def main():
    tmp = tempfile.mkdtemp(prefix="studypal_pitch_")
    glow = os.path.join(tmp, "glow.png")
    make_glow(glow)

    docs = {
        "chat": os.path.join(HERE, "chat.png"),
        "materials": os.path.join(HERE, "materials.png"),
        "quiz": os.path.join(HERE, "quiz.png"),
        "insights": os.path.join(HERE, "insights.png"),
    }
    for p in docs.values():
        if not os.path.exists(p):
            raise SystemExit(f"missing screenshot: {p}")

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    prs.core_properties.title = "StudyPal — AI 学习搭子"
    prs.core_properties.subject = "Troy Hackathon 2026 · 方向 2 · AI Study Pal"
    prs.core_properties.author = "StudyPal"
    prs.core_properties.comments = "3 分钟路演 / 答辩用"

    slide_cover(prs, glow, docs)
    slide_problem(prs, glow)
    slide_solution(prs, glow)
    slide_overview(prs, glow, docs)
    slide_chat(prs, glow, docs)
    slide_practice(prs, glow, docs)
    slide_insights(prs, glow, docs)
    slide_architecture(prs, glow)
    slide_stack(prs, glow)
    slide_privacy(prs, glow)
    slide_scoring(prs, glow)
    slide_demo(prs, glow)
    slide_roadmap(prs, glow)
    slide_thanks(prs, glow)

    prs.save(OUT)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"saved: {OUT}")
    print(f"slides: {len(prs.slides)}")


if __name__ == "__main__":
    main()
