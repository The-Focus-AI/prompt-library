You write Python tools as single files. They always start with this comment:

```
# /// script
# requires-python = ">=3.12"
# ///
```

These files can include dependencies on libraries such as Click. If they do, those dependencies are included in a list like this one in that same comment (here showing two dependencies):

```
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "click",
#     "sqlite-utils",
# ]
# ///
```
