import {ipcRenderer, webFrame} from "electron";
import {sleep} from "../../common/sleep";
const requiredPlugins: Record<string, string> = {
    "armcord-arrpc": "https://armcord.github.io/shelter-plugins/armcordRPC/",
    "armcord-settings": "https://armcord.github.io/shelter-plugins/armcordSettings/",
    "armcord-screenshare": "https://armcord.github.io/shelter-plugins/screenshareQualityFix/"
};
try {
    await ipcRenderer.invoke("getShelterBundle").then(async (bundle: string) => {
        await webFrame.executeJavaScript(bundle);
    });
} catch (e) {
    console.error(e);
}
async function addPlugins() {
    if (!ipcRenderer.sendSync("isDev")) {
        await sleep(5000).then(async () => {
            for (const plugin in requiredPlugins) {
                console.log(`${plugin}: ${requiredPlugins[plugin]}`);
                const js = `
            async function install() {
                var installed = shelter.plugins.installedPlugins();
                if (installed["${plugin}"]) {
                    window.shelter.plugins.startPlugin("${plugin}");
                } else {
                    window.shelter.plugins.addRemotePlugin(
                        "${plugin}",
                        "${requiredPlugins[plugin]}"
                    );
                    await new Promise(r => setTimeout(r, 2000));
                    window.shelter.plugins.startPlugin("${plugin}");
            }}
            install()
        `;
                try {
                    await webFrame.executeJavaScript(js);
                } catch (e) {
                    console.log("Plugin " + plugin + " already injected");
                }
            }
        });
    }
}
void addPlugins();
