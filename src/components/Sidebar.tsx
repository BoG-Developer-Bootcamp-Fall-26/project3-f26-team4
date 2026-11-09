export default function Sidebar() {
    return (
        <aside>
            <nav>
                <div>
                    <div className="flex">
                        <img src="/images/inactiveTrainingLogs.png" alt="trainings logo" />
                        <p>Training Logs</p>
                    </div>
                    <div className="flex">
                        <img src="/images/inactiveAnimalLogo.png" alt="animals logo" />
                        <p>Animals</p>
                    </div>
                </div>

                <div>
                    <h2>Admin access</h2>
                    <div className="flex">
                        <img src="/images/inactiveAllTrainingLogo.png" alt="all trainings logo" />
                        <p>All training</p>
                    </div>
                    <div className="flex">
                        <img src="/images/inactiveAllAnimalsLogo.png" alt="all animals logo" />
                        <p>All animals</p>
                    </div>
                    <div className="flex">
                        <img src="/images/inactiveAllUsersLogo.png" alt="all animals logo" />
                        <p>All users</p>
                    </div>
                </div>

                <div>
                    <div className="flex">
        
                    </div>
                </div>
            </nav>
        </aside>
    )
}