# Xircuits Component Library List


## Internal Library

These components will always be included in the Xircuits installation.

| Name     | Description                                                                                    |                                                                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tensorflow Keras | Deep learning related components using Tensorflow Keras.                                       | [Link](https://github.com/XpressAI/xircuits/tree/master/xai_components/xai_tensorflow_keras) |
| Pytorch  | Components that use Pytorch's ML library.                                                      | [Link](https://github.com/XpressAI/xircuits/tree/master/xai_components/xai_pytorch)   |
| Spark    | Components built using the Pyspark library. Run these components with the Xircuits Remote Run! | [Link](https://github.com/XpressAI/xircuits/tree/master/xai_components/xai_spark)       |
| Template | Great components for new learners and to experiment outputs.                                   | [Link](https://github.com/XpressAI/xircuits/tree/master/xai_components/xai_template) |
| Utils    | Commonly used components for day-to-day workflows.                                             | [Link](https://github.com/XpressAI/xircuits/tree/master/xai_components/xai_utils)       |


## External Library

Recognized additional component libraries that you can download using:

```
$ xircuits-components --sublib componentLibraryName
```

Don't forget to install their packages after fetching the library!

| Name                                                                                                                                                                                                       | Version |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| <b>[Pycaret](https://github.com/XpressAI/xai-pycaret)</b><br>A component library built using Pycaret's API! Complete with examples for NLP, anomaly detection, classification, clustering, as well as regression. | 0.1.0   |
| <b>[RPA](https://github.com/yuenherny/xai-rpa)</b><br>Robotic process automation library to automate routine and repetitive tasks!                                                                                | 0.1.0   |
| <b>[Streamlit](https://github.com/XpressAI/xai-streamlit)</b><br>Turn Xircuits workflows into shareable web apps in minutes.                                                                                                                                  | 0.1.0   |
| <b>[RabbitMQ](https://github.com/XpressAI/xai-rabbitmq)</b><br>Message broker in Xircuits that just works.                                                                                                                                                    | 0.1.0   |
| <b>[MQTT](https://github.com/XpressAI/xai-mqtt)</b><br>Xircuits library that implments the standard for IoT Messaging.                                                                                                                                    | 0.1.0   |
| 
<b>Modelstash</b><br>Coming Soon...             

Want your component library listed here? Just submit a PR to the Xircuits repository. For more information, refer to the [Xircuits component library documentation](https://xircuits.io/docs/technical-concepts/xircuits-component-library).