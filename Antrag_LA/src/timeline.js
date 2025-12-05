document.addEventListener('DOMContentLoaded', () => {
    const currentStep = parseInt(document.body.dataset.step);

    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        if (index + 1 < currentStep) {
            item.classList.add('completed');
            item.classList.remove('active', 'deactivated');
        } else if (index + 1 === currentStep) {
            item.classList.add('active');
            item.classList.remove('completed', 'deactivated');
        } else {
            item.classList.add('deactivated');
            item.classList.remove('completed', 'active');
        }
    });
});