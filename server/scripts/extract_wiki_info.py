from bs4 import BeautifulSoup
import re

def extract_info():
    with open('fc_barcelona_wiki.html', 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')

    print("SOURCE URL: https://en.wikipedia.org/wiki/FC_Barcelona")

    # Extract Honours
    print("\n=== HONOURS ===")
    honours_header = soup.find(id='Honours')
    if honours_header:
        # It might be inside a div
        parent = honours_header.find_parent('div', class_='mw-heading')
        start_node = parent if parent else honours_header
        
        current = start_node.find_next_sibling()
        while current:
            # Stop if we hit another header div or h2
            if current.name == 'h2' or (current.name == 'div' and 'mw-heading' in current.get('class', [])):
                break
                
            if current.name == 'table':
                rows = current.find_all('tr')
                for row in rows:
                    text = row.get_text(separator=' ', strip=True)
                    if text:
                        print(f"QUOTE: {text}")
            elif current.name == 'ul':
                items = current.find_all('li')
                for item in items:
                    text = item.get_text(separator=' ', strip=True)
                    if text:
                        print(f"QUOTE: {text}")
            current = current.find_next_sibling()

    # Extract Records
    print("\n=== RECORDS ===")
    records_header = soup.find(id='Records')
    if records_header:
        parent = records_header.find_parent('div', class_='mw-heading')
        start_node = parent if parent else records_header
        
        current = start_node.find_next_sibling()
        count = 0
        while current and count < 20:
            if current.name == 'ul':
                items = current.find_all('li')
                for item in items:
                    text = item.get_text(separator=' ', strip=True)
                    if text:
                        print(f"QUOTE: {text}")
            current = current.find_next_sibling()
            count += 1

    # Extract History (Headers and first paragraph)
    print("\n=== HISTORY ===")
    # Just get all H3 headers which usually denote eras
    content = soup.find(id='mw-content-text')
    if content:
        headers = content.find_all(['h2', 'h3'])
        for header in headers:
            text = header.get_text(separator=' ', strip=True)
            if 'History' in text or 'era' in text or 'years' in text:
                print(f"HEADER: {text}")
                # Print the first paragraph after this header
                next_p = header.find_next_sibling('p')
                if next_p:
                    print(f"QUOTE: {next_p.get_text(separator=' ', strip=True)}")

    # Extract Players (Current squad)
    print("\n=== PLAYERS ===")
    players_header = soup.find('h3', id='Current_squad')
    if players_header:
        # Look for the table
        table = players_header.find_next('table')
        if table:
            rows = table.find_all('tr')
            for row in rows:
                text = row.get_text(separator=' ', strip=True)
                # Filter for rows that look like player entries (have numbers)
                if re.search(r'\d+', text):
                    print(f"QUOTE: {text}")

if __name__ == "__main__":
    extract_info()
