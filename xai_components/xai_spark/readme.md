# XAI-Spark Components

Currently XAI Spark components are tested and working on 
- Windows 10 Spark 3.1.2 and Hadoop 3.2
- Centos 8 [Vector Engine] Spark 3.1.1 and Hadoop 3.3
- WSL Ubuntu 20.04 Spark 3.3.2

## Installation on Windows

Refer to this documentation for installation: https://sparkbyexamples.com/spark/apache-spark-installation-on-windows/


Once complete, try:

```
# cd into your spark dir and run spark-shell

PS C:\apps\opt\spark-3.1.2-bin-hadoop3.2\bin> spark-shell
Using Spark's default log4j profile: org/apache/spark/log4j-defaults.properties
Setting default log level to "WARN".
To adjust logging level use sc.setLogLevel(newLevel). For SparkR, use setLogLevel(newLevel).
21/11/02 13:15:07 WARN Utils: Service 'SparkUI' could not bind on port 4040. Attempting port 4041.
Spark context Web UI available at http://LAPTOP-71A1ED6U:4041
Spark context available as 'sc' (master = local[*], app id = local-1635830108092).
Spark session available as 'spark'.
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /___/ .__/\_,_/_/ /_/\_\   version 3.1.2
      /_/

Using Scala version 2.12.10 (Java HotSpot(TM) 64-Bit Server VM, Java 1.8.0_261)
Type in expressions to have them evaluated.
Type :help for more information.

scala>
```

You can also see the Spark web UI by accessing http://localhost:4040/

![image](https://user-images.githubusercontent.com/68586800/139038251-cbfd452f-0eab-41bc-9e09-50bfd3a6cf33.png)


## WSL

We use Windows Subsystem for Linux (WSL) to test out the Linux distributions. You can refer to [this guide](https://kontext.tech/column/spark/311/apache-spark-243-installation-on-windows-10-using-windows-subsystem-for-linux) for installing Spark on WSL. 
The tested versions are: 
- [Spark 3.1.2 - Hadoop 3.2](https://www.apache.org/dyn/closer.lua/spark/spark-3.1.2/spark-3.1.2-bin-hadoop3.2.tgz)
- Spark 3.3.2 - Hadoop 3.3


## Errors:

    # java.io.FileNotFoundException: Could not locate Hadoop executable: C:\apps\opt\spark-3.1.2-bin-hadoop3.2\bin\winutils.exe -see https://wiki.apache.org/hadoop/WindowsProblems

Download corresponding Hadoop winutils from https://github.com/cdarlint/winutils



## Datasets

### Wind.csv
Modified from https://github.com/rishabh89007/Time_Series_Datasets
### Pinguin.csv
https://github.com/allisonhorst/palmerpenguins // https://www.kaggle.com/parulpandey/penguin-dataset-the-new-iris/data
### Mushrooms.txt
https://www.csie.ntu.edu.tw/~cjlin/libsvmtools/datasets/binary.html#mushrooms
### sample_libsvm_data.txt
https://github.com/apache/spark/blob/master/data/mllib/sample_libsvm_data.txt
