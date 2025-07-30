import { navigateTo, escapeHTML } from "../main";
import { t } from "../i18n";
import { dashboardView, attachDashboardViewEvents} from "./dashboard_view"
import { dashboardEditView, attachDashboardEditEvents} from "./dashboard_edit"
import { dashboardFriendsView, attachDashboardFriendsEvents} from "./dashboard_friends"

let isDashboardListenerAttached = false;

export function dashboardMainView() {
    return `
        <div class="dashboard-bg min-h-screen">
            <div class="w-full max-w-[1800px] mx-auto">
                <div class="flex gap-4 mb-8" id="dashboard-menu">
                    <button class="btn-main dashboard-menu-btn active" data-section="home">
                        Accueil
                    </button>
                    <button class="btn-main dashboard-menu-btn" data-section="friends">
                        Friends
                    </button>
                    <button class="btn-main dashboard-menu-btn" data-section="edit">
                        Edit
                    </button>
                </div>
                <div>
                    <div id="content"></div>
                </div>
            </div>
        </div>
    `;
}

export function attachDashboardMainEvents ()
{
    const content = document.querySelector('#content');
    if (!content) return;
    content.innerHTML = dashboardView();
    attachDashboardViewEvents();
    if (isDashboardListenerAttached) return;
    document.addEventListener('click', (event) => {
        if ((event.target as HTMLElement)?.matches('[data-section]')) {
            event.preventDefault();
            const section = (event.target as HTMLElement).dataset.section;
            const content = document.querySelector('#content');
            if (!content) return;
            switch(section) {
                case 'home':
                    content.innerHTML = dashboardView();
                    attachDashboardViewEvents();
                    break;
                case 'edit':
                    content.innerHTML = dashboardEditView();
                    attachDashboardEditEvents();
                    break;
                case 'friends':
                    content.innerHTML = dashboardFriendsView();
                    attachDashboardFriendsEvents();
                    break;
            }
            
            // Gérer les classes CSS
            document.querySelectorAll('[data-section]').forEach(btn => {
                btn.classList.remove('active');
            });
            (event.target as HTMLElement).classList.add('active');
        }
    });
    isDashboardListenerAttached = true;
}
