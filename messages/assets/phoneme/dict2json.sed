/^;;;/d
s/"/\\"/g
s/^([^ ]+) /{"Word":{"s":"\1"},"Phonemes":{"l":[/
s/( ([A-Z0-9]+))/{"s":"\2"},/g
s/,$/]}}/
