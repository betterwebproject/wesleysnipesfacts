import json
import re

def main():
    with open('posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)

    errors = []
    prev_num = None
    for i, post in enumerate(posts):
        post_id = post.get('id')
        title = post.get('title', '')
        # Special cases
        if post_id in ['alert', 'big-book']:
            continue
        # Check id is int and title matches
        if not isinstance(post_id, int):
            errors.append(f"Post {i}: id is not int: {post_id}")
            continue
        match = re.match(r'^Fact #(\d+)$', title)
        if not match:
            errors.append(f"Post {i}: title format error: {title}")
            continue
        title_num = int(match.group(1))
        if post_id != title_num:
            errors.append(f"Post {i}: id/title mismatch: id={post_id}, title={title}")
        if prev_num is not None and post_id != prev_num + 1:
            errors.append(f"Gap or out-of-order: previous id={prev_num}, current id={post_id}")
        prev_num = post_id
    if errors:
        print("Errors found:")
        for err in errors:
            print(err)
    else:
        print("✓ All numeric ids and titles match, and are consecutive without gaps.")

if __name__ == '__main__':
    main()
