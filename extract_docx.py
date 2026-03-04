import zipfile
import re
from xml.etree import ElementTree

def extract_docx(doc_path, txt_path):
    z = zipfile.ZipFile(doc_path)
    xml_content = z.read('word/document.xml')
    tree = ElementTree.fromstring(xml_content)
    
    text = []
    for node in tree.iter():
        if node.text:
            text.append(node.text)
            
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(' '.join(text))

extract_docx('d:\\My Projects\\Kavach-Final\\Kavach Project Synopsis.docx', 'd:\\My Projects\\Kavach-Final\\synopsis_utf8.txt')
extract_docx('d:\\My Projects\\Kavach-Final\\Kavach Black Book Piyush.docx', 'd:\\My Projects\\Kavach-Final\\blackbook_utf8.txt')
