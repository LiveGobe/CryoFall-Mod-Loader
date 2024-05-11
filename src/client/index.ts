import { setCurrentView, setLaunchType, ViewType } from "./app"
import { initConfigView } from "./views/config"
import { initModView } from "./views/mod"
import { initModListView } from "./views/mod-list"
import { initUploadView } from "./views/upload"

// load data
!async function () {
    await Promise.all([
        initUploadView(),
        initConfigView(),
        initModListView(),
        initModView(),
    ])
    setCurrentView(ViewType.modList)
    setLaunchType(CryoFallModLoader.LaunchType.client)
}()