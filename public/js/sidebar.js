document.addEventListener('DOMContentLoaded', function () {
    const openSidebarButton = document.getElementById('open-sidebar');
    const closeSidebarButton = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');

    // Open sidebar
    openSidebarButton.addEventListener('click', () => {
        sidebar.classList.add('open');
        openSidebarButton.classList.add('hidden'); // Hide the open button
    });

    // Close sidebar
    closeSidebarButton.addEventListener('click', () => {
        sidebar.classList.remove('open');
        openSidebarButton.classList.remove('hidden'); // Show the open button
    });

    // Variables for dragging
    let isDragging = false;
    let startY;
    let startTop;

    function startDragging(e) {
        isDragging = true;
        startY = e.clientY || e.touches[0].clientY;
        startTop = openSidebarButton.offsetTop;
        document.body.classList.add('no-select'); // Prevent text selection while dragging
    }

    function dragMove(e) {
        if (isDragging) {
            const currentY = e.clientY || e.touches[0].clientY;
            const newY = startTop + (currentY - startY);

            // Get viewport height
            const viewportHeight = window.innerHeight;

            // Ensure the button stays within bounds
            const buttonHeight = openSidebarButton.offsetHeight;
            const minY = 0;
            const maxY = viewportHeight - buttonHeight;

            // Constrain newY within the bounds
            const constrainedY = Math.max(minY, Math.min(maxY, newY));

            openSidebarButton.style.top = `${constrainedY}px`;
        }
    }

    function stopDragging() {
        isDragging = false;
        document.body.classList.remove('no-select');
    }

    // Mouse events
    openSidebarButton.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', stopDragging);

    // Touch events
    openSidebarButton.addEventListener('touchstart', startDragging);
    document.addEventListener('touchmove', dragMove);
    document.addEventListener('touchend', stopDragging);
});
