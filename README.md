# Obsidian-Exec-Code-Block

## Setting

```json
{
  "execDir": "exec dir full path",
  "codeCmd": "code btn full path",
  "execLangs": [
    {
      "lang": "c",
      "filename": "tmp.c",
      "execCmd": "gcc tmp.c && ./a.out"
    },
    {
      "lang": "python",
      "filename": "tmp.py",
      "execCmd": "python3 -u tmp.py"
    },
    {
      "lang": "shell",
      "filename": "tmp.sh",
      "execCmd": "/usr/local/bin/docker run -t --rm -v $(pwd):/workdir -w /workdir ubuntu bash -c 'bash tmp.sh'"
    }
  ]
}
```

- execDir : Directory where the command is executed
- codeCmd : Vscode Code Cmd Path -> exec codeCmd execDir
- execLangs
  - lang : Same language as the code block in the markdown
  - filename : Name of file to be created in execdir
  - execCmd : Commands to execute in execDir
