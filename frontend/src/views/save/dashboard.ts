import { navigateTo, escapeHTML } from "../main";
import { t } from "../i18n";
import { dashboardView, attachDashboardViewEvents} from "./dashboard_view"
import { dashboardEditView, attachDashboardEditEvents} from "./dashboard_edit"
import { dashboardFriendsView, attachDashboardFriendsEvents} from "./dashboard_friends"

let isDashboardListenerAttached = false;

export function dashboardMainView ()
{
    return `
        <div>
            <button data-section="home">Accueil</button>
            <button data-section="friends">friends</button>
            <button data-section="edit">edit</button>
        </div>
        </br>
        <div>
            <div id="content"></div>
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
