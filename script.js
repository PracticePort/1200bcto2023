document.addEventListener('DOMContentLoaded', function () {
  fetch('https://raw.githubusercontent.com/PracticePort/BareMinimumEE-EE/main/The%20Bare%20Minimum%20-%20Second%20Pass%20Expelling%20Events%20(3).csv')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch CSV');
      }
      return response.text();
    })
    .then(data => {
      const parsedData = Papa.parse(data, { header: true });

      // Define a function to extract country names
      function extractCountry(place) {
        const parts = place.split(', ');
        return parts.length > 1 ? parts[parts.length - 1] : place;
      }

      // Clean up the 'Place' column and extract country names
      parsedData.data.forEach(rowData => {
        rowData['Country Only - Place'] = extractCountry(rowData['Place']);
      });

      // Get the top 45 countries based on frequency
      const expulsionsByCountry = parsedData.data.reduce((acc, curr) => {
        const country = extractCountry(curr['Place']);
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});

      const top45Countries = Object.keys(expulsionsByCountry)
        .sort((a, b) => expulsionsByCountry[b] - expulsionsByCountry[a])
        .slice(0, 45);

      // Populate the filter dropdown
      const dropdown = document.getElementById('filter-dropdown');
      dropdown.innerHTML = '<option value="All">All</option>';
      top45Countries.forEach(country => {
        dropdown.innerHTML += `<option value="${country}">${country}</option>`;
      });

      // Function to generate and populate cards
      function populateCards(expulsions) {
        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML = ''; // Clear previous cards

        expulsions.forEach(expulsion => {
          const card = document.createElement('div');
          card.classList.add('card');

          // Header section of the card
          const header = document.createElement('div');
          header.classList.add('card-header');
          header.innerHTML = `<h2>${expulsion['Year']} - ${expulsion['Place']} <span class="smaller-font">Primary motivator: ${expulsion['Dropdown Cited FP']}</span></h2><p>${expulsion['Governing Body']}</p>`;
          card.appendChild(header);

          // Description section of the card
          const descriptionElement = document.createElement('p');
          descriptionElement.textContent = expulsion['Description (Not Clean)'];
          descriptionElement.style.fontSize = '0.8rem'; // Adjust the font size as needed
          card.appendChild(descriptionElement);

          // Icon representation based on criteria
          const iconContainer = document.createElement('div');
          iconContainer.classList.add('icon-container');

          // Check for each criteria and add corresponding icon
          if (expulsion['Violence >49'] === '1' || expulsion['Violence <50'] === '1') {
            const icon = document.createElement('span');
            icon.innerHTML = '<i class="fas fa-skull-crossbones" data-tooltip="Violent"></i>';
            iconContainer.appendChild(icon);
          }

          if (expulsion['Symbolic'] === '1') {
            const icon = document.createElement('span');
            icon.innerHTML = '<i class="fas fa-medal" data-tooltip="Symbolic"></i>';
            iconContainer.appendChild(icon);
          }

          if (expulsion['PJA'] === '1' || expulsion['T'] === '1' || expulsion['I/V'] === '1') {
            const icon = document.createElement('span');
            icon.innerHTML = '<i class="fas fa-poo-storm" data-tooltip="Jews Identified as Threatening"></i>';
            iconContainer.appendChild(icon);
          }

          if (expulsion['Attempted Inclusion'] === '1') {
            const icon = document.createElement('span');
            icon.innerHTML = '<i class="fas fa-user-group" data-tooltip="Attempted Inclusion"></i>';
            iconContainer.appendChild(icon);
          }

          if (expulsion['E/SR'] === '1') {
            const icon = document.createElement('span');
            icon.innerHTML = '<i class="fas fa-list-ol" data-tooltip="More expulsions around this zone not explicitly recorded"></i>';
            iconContainer.appendChild(icon);
          }

          // Verification note
          const verificationNote = document.createElement('span');
          verificationNote.textContent = `Verified by Popular Sources: ${expulsion['Verified'] === '1' ? 'Yes' : 'No'}`;
          iconContainer.appendChild(verificationNote);

          card.appendChild(iconContainer);

          // Adding the card to the container
          cardContainer.appendChild(card);

          // Add event listeners for hover effect on year and place
          header.addEventListener('mouseover', function () {
            header.style.color = '#0038b8';
          });
          header.addEventListener('mouseout', function () {
            header.style.color = '';
          });
        });

        // Add tooltip functionality
        const tooltips = document.querySelectorAll('[data-tooltip]');
        tooltips.forEach(tooltip => {
          tooltip.addEventListener('mouseover', function () {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltipElement = document.createElement('div');
            tooltipElement.classList.add('tooltip');
            tooltipElement.textContent = tooltipText;
            document.body.appendChild(tooltipElement);
          });

          tooltip.addEventListener('mouseout', function () {
            const tooltipElement = document.querySelector('.tooltip');
            if (tooltipElement) {
              tooltipElement.remove();
            }
          });
        });
      }

      // Initial display of all expulsions
      populateCards(parsedData.data.filter(rowData => rowData['Expelled'] === '1'));

      // Update cards when filter is changed
      dropdown.addEventListener('change', function () {
        const selectedCountry = dropdown.value;
        const filteredExpulsions = selectedCountry === 'All' ?
          parsedData.data.filter(rowData => rowData['Expelled'] === '1') :
          parsedData.data.filter(rowData => rowData['Country Only - Place'] === selectedCountry && rowData['Expelled'] === '1');
        populateCards(filteredExpulsions);
      });

    })
    .catch(error => console.error('Error fetching CSV:', error));
});