import membersJson from './ai-members.json' with { type: 'json' };
import populateMembers from '../JS-utils/membersPopulator.js';
populateMembers(membersJson);


const hamburger = document.querySelector(".hamburger");
const navContainer = document.querySelector(".nav-container");

hamburger.addEventListener("click", () => {
  navContainer.classList.toggle("active");
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest("nav")) {
    navContainer.classList.remove("active");
  }
});

// Year tabs functionality
document.addEventListener('DOMContentLoaded', function() {
    const yearTabs = document.querySelectorAll('.year-tab');
    const yearContents = document.querySelectorAll('.year-content');
    
    yearTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            yearTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all content sections
            yearContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // Show the selected year's content
            const year = this.getAttribute('data-year');
            const selectedContent = document.getElementById(`content-${year}`);
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
        });
    });
});
