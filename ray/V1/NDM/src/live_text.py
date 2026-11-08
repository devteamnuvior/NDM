"""Shared text rule for the live copy (approval item A1, approved by Raymond 7 Nov 2026): em dashes and spaced en dashes used as
sentence breaks become commas; hyphens and unspaced en dashes in ranges ("3-7 days", "2–3 months") and names stay."""
import re


def dashes(s):
    if not isinstance(s, str) or ('—' not in s and '–' not in s): return s
    s = re.sub(r'\s*—\s*', ', ', s)
    s = re.sub(r'(?<=\S)[  ]+–[  ]+(?=\S)', ', ', s)
    s = re.sub(r'(?<=[^\s\d>])–(?=[ \u00a0])', ',', s)        # "surgery– another" (a dash glued to the word before it)
    s = re.sub(r'(?<=>)–(?=[ \u00a0])', ',', s)                 # the same after a closing tag: "</strong>– another"
    s = s.replace('(, ', '(').replace(', )', ')').replace(':, ', ': ').replace(',, ', ', ').replace(', ,', ',').replace('., ', '. ')
    s = re.sub(r'^, ', '', s)
    return s


def deep(x, skip=()):
    """apply dashes() to every string in a JSON-like structure, except under the given keys (names, addresses, codes)"""
    if isinstance(x, str): return dashes(x)
    if isinstance(x, list): return [deep(v, skip) for v in x]
    if isinstance(x, dict): return {k: (v if k in skip else deep(v, skip)) for k, v in x.items()}
    return x
