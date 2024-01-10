export function doRemoteRun(path: string, command: string, msg: string, url){

    try {
      let command_str = command + " " + path;
      let code_str = "\nfrom subprocess import Popen, PIPE\n\n";

      code_str += `command_str= "${command_str}"\n`;
      code_str += "p=Popen(command_str, stdout=PIPE, stderr=PIPE, universal_newlines=True, shell=True)\n";
      code_str += "print('Remote Execution Run Mode.\\n')\n";
      code_str += `print(f'Running {command_str}...\\n')\n`;
      code_str += `print('Please go to ${url} for more details\\n')\n`;
      code_str += `print('${msg}\\n')\n`;
      code_str += "for line in p.stdout:\n";
      code_str += "    " + "print(line.rstrip())\n\n";
      code_str += "if p.returncode != 0:\n";
      code_str += "    " + "print(p.stderr.read())";

      return code_str;
    } catch (e) {
      console.log(e)
    }
  }