General Spark Installation for Windows

Refer to this documentation:
https://sparkbyexamples.com/spark/apache-spark-installation-on-windows/

Once complete, try: 
    $ cd %SPARK_HOME%/bin
    $ spark-shell

Access http://localhost:4040/

![image](https://user-images.githubusercontent.com/68586800/139038251-cbfd452f-0eab-41bc-9e09-50bfd3a6cf33.png)


Errors:

    # java.io.FileNotFoundException: Could not locate Hadoop executable: C:\apps\opt\spark-3.1.2-bin-hadoop3.2\bin\winutils.exe -see https://wiki.apache.org/hadoop/WindowsProblems
^ Download winutils from https://github.com/cdarlint/winutils

    # java.io.IOException: Cannot run program "python3": CreateProcess error=2, The system cannot find the file specified

    import os 
    os.environ['PYSPARK_PYTHON'] = sys.executable
    os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable