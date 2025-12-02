import json

def merge_questions():
    with open('generated_questions_fc_barcelona_part1.json', 'r', encoding='utf-8') as f1:
        q1 = json.load(f1)
    
    with open('generated_questions_fc_barcelona_part2.json', 'r', encoding='utf-8') as f2:
        q2 = json.load(f2)
    
    merged = q1 + q2
    
    print(f"Merged {len(q1)} + {len(q2)} = {len(merged)} questions.")
    
    with open('generated_questions_fc_barcelona.json', 'w', encoding='utf-8') as f_out:
        json.dump(merged, f_out, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    merge_questions()
