lines = []
with open("siteNames.txt") as f:
    lines = f.readlines()

with open("siteNames.txt", 'w') as f:
    f.writelines(sorted(lines))
