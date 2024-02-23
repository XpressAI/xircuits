import * as SRD from '@projectstorm/react-diagrams';
import { BaseComponentLibrary } from '../tray_library/BaseComponentLib';
import { ParameterLinkFactory, TriangleLinkFactory } from '../components/link/CustomLinkFactory';
import { CustomNodeFactory } from '../components/node/CustomNodeFactory';
import { JupyterFrontEnd } from '@jupyterlab/application';

export function createInitXircuits(app: JupyterFrontEnd, shell) {

    const diagramEngine = SRD.default({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });
    
    // Create a new diagram model
    const activeModel = new SRD.DiagramModel();

    diagramEngine.getLinkFactories().registerFactory(new ParameterLinkFactory());
    diagramEngine.getLinkFactories().registerFactory(new TriangleLinkFactory());
    diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory(app, shell));

    let startNode = BaseComponentLibrary('Start')
    startNode.setPosition(100, 100);
    let finishNode = BaseComponentLibrary('Finish')
    finishNode.setPosition(700, 100);

    activeModel.addAll(startNode, finishNode);
    diagramEngine.setModel(activeModel);

    let currentModel = diagramEngine.getModel().serialize();

    let jsonString = JSON.stringify(currentModel, null, 4);

    return jsonString;
}