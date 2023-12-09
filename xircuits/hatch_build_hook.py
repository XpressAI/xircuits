from hatchling.builders.hooks.plugin.interface import BuildHookInterface
import shutil

class XircuitsBuildHook(BuildHookInterface):
    PLUGIN_NAME = 'xircuits'

    def initialize(self, version, build_data):
        shutil.copyfile('.gitmodules', 'xircuits/.xircuits/.gitmodules')
