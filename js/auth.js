import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Session Check
    const { data: { session } } = await supabase.auth.getSession();
    const currentPage = window.location.pathname.split('/').pop();

    // If on protected dashboard pages and no active session, redirect to index
    if (!session && (currentPage === 'dashboard.html' || currentPage === 'history.html' || currentPage === 'settings.html')) {
        // Uncomment line below if strict auth redirect is needed
        // window.location.href = 'index.html';
    }

    // Handle Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        });
    }
});
