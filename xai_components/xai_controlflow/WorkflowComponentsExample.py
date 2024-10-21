from argparse import ArgumentParser
from xai_components.base import SubGraphExecutor, InArg, OutArg, Component, xai_component, parse_bool
from xai_components.xai_utils.utils import Print, ConcatString

@xai_component(type='xircuits_workflow')
class WorkflowComponentsExample(Component):
    example_input: InArg[str]
    output: OutArg[str]

    def __init__(self):
        super().__init__()
        self.__start_nodes__ = []
        self.c_0 = Print()
        self.c_1 = ConcatString()
        self.c_0.msg.connect(self.c_1.out)
        self.c_1.b.connect(self.example_input)
        self.c_1.a.value = 'This component echo the input string: \n'
        self.output.connect(self.c_1.out)
        self.c_0.next = None
        self.c_1.next = self.c_0

    def execute(self, ctx):
        for node in self.__start_nodes__:
            if hasattr(node, 'init'):
                node.init(ctx)
        next_component = self.c_1
        while next_component is not None:
            next_component = next_component.do(ctx)

def main(args):
    import pprint
    ctx = {}
    ctx['args'] = args
    flow = WorkflowComponentsExample()
    flow.next = None
    flow.example_input.value = args.example_input
    flow.do(ctx)
    print('output:')
    pprint.pprint(flow.output.value)
if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--example_input', type=str)
    args, _ = parser.parse_known_args()
    main(args)
    print('\nFinished Executing')