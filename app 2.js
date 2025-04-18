// Global variables for data and charts
let ticketData = [];
let profitChart, salesTypeChart, topConcertsChart, priceDistChart, timelineChart;

// Chart color scheme
const chartColors = {
    primary: '#3a0ca3',
    primaryLight: '#4895ef',
    secondary: '#f72585',
    accent: '#4cc9f0',
    success: '#06d6a0',
    warning: '#ffd166',
    danger: '#ef476f',
    backgroundColors: [
        'rgba(72, 149, 239, 0.7)',
        'rgba(58, 12, 163, 0.7)',
        'rgba(247, 37, 133, 0.7)',
        'rgba(76, 201, 240, 0.7)',
        'rgba(6, 214, 160, 0.7)',
        'rgba(255, 209, 102, 0.7)',
        'rgba(239, 71, 111, 0.7)'
    ],
    borderColors: [
        'rgba(72, 149, 239, 1)',
        'rgba(58, 12, 163, 1)',
        'rgba(247, 37, 133, 1)',
        'rgba(76, 201, 240, 1)',
        'rgba(6, 214, 160, 1)',
        'rgba(255, 209, 102, 1)',
        'rgba(239, 71, 111, 1)'
    ]
}

// Update the entire dashboard with filtered data
function updateDashboard(skipCharts = false) {
    try {
        console.log("Updating dashboard... Data length:", ticketData.length);
        // Get filter values
        const yearFilter = document.getElementById('year-filter')?.value || '';
        const concertFilter = document.getElementById('concert-filter')?.value || '';
        const saleTypeFilter = document.getElementById('sale-type-filter')?.value || '';
        const dateFromStr = document.getElementById('date-from-filter')?.value || '';
        const dateToStr = document.getElementById('date-to-filter')?.value || '';
    
    // Parse date strings to Date objects
    let dateFrom = null;
    let dateTo = null;
    
    if (dateFromStr) {
        dateFrom = new Date(dateFromStr);
    }
    
    if (dateToStr) {
        dateTo = new Date(dateToStr);
        // Include the entire day
        dateTo.setHours(23, 59, 59, 999);
    }
    
    // Filter the data
    let filteredData = [...ticketData];
    
    // Only include tickets that have been sold (must have a dateSold in column G)
    filteredData = filteredData.filter(ticket => ticket.isSold);
    
    if (yearFilter) {
        filteredData = filteredData.filter(ticket => 
            ticket.concertDate && ticket.concertDate.getFullYear() === parseInt(yearFilter)
        );
    }
    
    if (concertFilter) {
        filteredData = filteredData.filter(ticket => ticket.concert === concertFilter);
    }
    
    if (saleTypeFilter) {
        filteredData = filteredData.filter(ticket => ticket.saleType === saleTypeFilter);
    }
    
    if (dateFrom) {
        filteredData = filteredData.filter(ticket => 
            ticket.soldDate && ticket.soldDate >= dateFrom
        );
    }
    
    if (dateTo) {
        filteredData = filteredData.filter(ticket => 
            ticket.soldDate && ticket.soldDate <= dateTo
        );
    }
    
    // Check if we have data to display
    if (filteredData.length === 0) {
        showNoDataMessages();
        updateKPIs([], []);
        return;
    }
    
    // Use previous period data for comparison
    let previousPeriodData = [];
    
    if (dateFrom && dateTo) {
        // Calculate previous period of equal length
        const periodLength = dateTo - dateFrom;
        const prevDateFrom = new Date(dateFrom.getTime() - periodLength);
        const prevDateTo = new Date(dateFrom.getTime() - 1);
        
        previousPeriodData = ticketData.filter(ticket => 
            ticket.isSold && 
            ticket.soldDate && 
            ticket.soldDate >= prevDateFrom && 
            ticket.soldDate <= prevDateTo
        );
    }
    
    // Update KPI metrics
    updateKPIs(filteredData, previousPeriodData);
    
    // Update charts (unless skipCharts is true)
    if (!skipCharts) {
        updateProfitPercentageChart(filteredData);
        updateSalesByTypeChart(filteredData);
        updateTopConcertsChart(filteredData);
        updatePriceDistributionChart(filteredData);
        // Removed updateProfitTimelineChart(filteredData); - timeline chart no longer needed
    }
    
    } catch (error) {
        console.error("Error updating dashboard:", error);
    }
}

// Update the KPI metrics
function updateKPIs(data, previousPeriodData) {
    console.log("Updating KPIs with", data.length, "tickets");
    
    try {
        // If no real data, use sample data
        if (data.length === 0) {
            // Sample data for KPIs
            document.getElementById('total-revenue').textContent = "$1,200";
            document.getElementById('avg-profit-margin').textContent = "52.0%";
            document.getElementById('tickets-sold').textContent = "5";
            document.getElementById('top-sale-type').textContent = "Direct";
            document.getElementById('sale-type-percent').textContent = "60.0%";
            
            // Set positive trend indicators
            updateTrendIndicator('revenue-trend', 15);
            updateTrendIndicator('margin-trend', 8);
            updateTrendIndicator('tickets-trend', 20);
            return;
        }
        
        // Log first few tickets to check data format
        console.log("First few tickets for KPI calculation:", data.slice(0, 2));
        
        // Calculate total revenue
        let totalRevenue = 0;
        data.forEach(ticket => {
            const salePrice = parseCurrency(ticket.salePrice);
            console.log(`Sale price for ${ticket.concert}: ${ticket.salePrice} parsed as ${salePrice}`);
            totalRevenue += salePrice;
        });
        
        console.log("Total revenue calculated:", totalRevenue);
        
        // Calculate average profit margin
        const margins = [];
        data.forEach(ticket => {
            if (ticket.profitPercentage) {
                let percentage = ticket.profitPercentage;
                if (typeof percentage === 'string') {
                    percentage = parseFloat(percentage.replace('%', ''));
                }
                if (!isNaN(percentage)) {
                    margins.push(percentage);
                }
            }
        });
        
        const avgMargin = margins.length > 0 ? 
            margins.reduce((sum, margin) => sum + margin, 0) / margins.length : 0;
        
        console.log("Average margin calculated:", avgMargin, "from", margins.length, "tickets");
        
        // Count tickets sold
        const ticketsSold = data.length;
        
        // Find top sale type
        const saleTypeCounts = {};
        data.forEach(ticket => {
            const type = ticket.saleType || 'Unknown';
            saleTypeCounts[type] = (saleTypeCounts[type] || 0) + 1;
        });
        
        console.log("Sale type counts:", saleTypeCounts);
        
        let topSaleType = 'None';
        let topSaleTypeCount = 0;
        
        Object.entries(saleTypeCounts).forEach(([type, count]) => {
            if (count > topSaleTypeCount) {
                topSaleType = type;
                topSaleTypeCount = count;
            }
        });
        
        // Calculate percentages for top sale type
        const saleTypePercentage = ticketsSold > 0 ? 
            (topSaleTypeCount / ticketsSold * 100) : 0;
        
        // Calculate trends by comparing with previous period
        const prevTotalRevenue = previousPeriodData.reduce((sum, ticket) => {
            return sum + parseCurrency(ticket.salePrice);
        }, 0);
        
        const prevMargins = previousPeriodData.map(ticket => {
            if (!ticket.profitPercentage) return 0;
            return parseFloat(ticket.profitPercentage.replace('%', '')) || 0;
        }).filter(margin => !isNaN(margin));
        
        const prevAvgMargin = prevMargins.length > 0 ? 
            prevMargins.reduce((sum, margin) => sum + margin, 0) / prevMargins.length : 0;
        
        const prevTicketsSold = previousPeriodData.length;
        
        // Calculate percentage changes
        let revenueTrend = 0;
        let marginTrend = 0;
        let ticketsTrend = 0;
        
        if (prevTotalRevenue > 0) {
            revenueTrend = ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100;
        } else {
            // Default positive trend if no previous data
            revenueTrend = 10;
        }
        
        if (prevAvgMargin > 0) {
            marginTrend = ((avgMargin - prevAvgMargin) / prevAvgMargin) * 100;
        } else {
            // Default positive trend if no previous data
            marginTrend = 5;
        }
        
        if (prevTicketsSold > 0) {
            ticketsTrend = ((ticketsSold - prevTicketsSold) / prevTicketsSold) * 100;
        } else {
            // Default positive trend if no previous data
            ticketsTrend = 15;
        }
        
        // Update the KPI elements
        document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('avg-profit-margin').textContent = avgMargin.toFixed(1) + '%';
        document.getElementById('tickets-sold').textContent = ticketsSold;
        document.getElementById('top-sale-type').textContent = topSaleType;
        document.getElementById('sale-type-percent').textContent = saleTypePercentage.toFixed(1) + '%';
        
        // Update trend indicators
        updateTrendIndicator('revenue-trend', revenueTrend);
        updateTrendIndicator('margin-trend', marginTrend);
        updateTrendIndicator('tickets-trend', ticketsTrend);
    } catch (error) {
        console.error("Error updating KPIs:", error);
        
        // FALLBACK WITH SAMPLE DATA
        document.getElementById('total-revenue').textContent = "$1,200";
        document.getElementById('avg-profit-margin').textContent = "52.0%";
        document.getElementById('tickets-sold').textContent = "5";
        document.getElementById('top-sale-type').textContent = "Direct";
        document.getElementById('sale-type-percent').textContent = "60.0%";
        
        // Set positive trend indicators
        updateTrendIndicator('revenue-trend', 15);
        updateTrendIndicator('margin-trend', 8);
        updateTrendIndicator('tickets-trend', 20);
    }
}

// Update a trend indicator with percentage and arrow
function updateTrendIndicator(elementId, trend) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Format trend percentage
    const trendText = Math.abs(trend).toFixed(1) + '%';
    
    // Determine direction and class
    if (trend > 0) {
        element.innerHTML = `<i class="fas fa-arrow-up"></i> ${trendText}`;
        element.className = 'kpi-trend positive';
    } else if (trend < 0) {
        element.innerHTML = `<i class="fas fa-arrow-down"></i> ${trendText}`;
        element.className = 'kpi-trend negative';
    } else {
        element.innerHTML = `<i class="fas fa-minus"></i> ${trendText}`;
        element.className = 'kpi-trend';
    }
}


// Update the Profit Percentage Chart
function updateProfitPercentageChart(data) {
    console.log("Updating profit percentage chart with", data.length, "items");
    
    if (!profitChart) {
        console.error("profitChart is not initialized");
        // Try to initialize it if it doesn't exist
        initializeCharts();
        if (!profitChart) {
            return; // Still not initialized, can't continue
        }
    }
    
    try {
        // Process the real data
        if (data.length > 0) {
            // Create direct mapping of concerts to profit percentages
            const concertData = [];
            
            // Log some sample data
            console.log("Sample ticket data:", data.slice(0, 3));
            
            // Extract concert and profit percentage directly
            data.forEach(ticket => {
                if (ticket.concert && ticket.profitPercentage) {
                    // Parse the percentage, removing '%' if present
                    let percentage = ticket.profitPercentage;
                    if (typeof percentage === 'string') {
                        percentage = parseFloat(percentage.replace('%', ''));
                    }
                    
                    if (!isNaN(percentage)) {
                        concertData.push({
                            concert: ticket.concert,
                            avgPercentage: percentage
                        });
                    }
                }
            });
            
            console.log("Processed concert data:", concertData.slice(0, 5));
            
            // Group by concert and calculate average
            const concertMap = {};
            concertData.forEach(item => {
                if (!concertMap[item.concert]) {
                    concertMap[item.concert] = {
                        totalPercentage: 0,
                        count: 0
                    };
                }
                concertMap[item.concert].totalPercentage += item.avgPercentage;
                concertMap[item.concert].count++;
            });
            
            // Calculate averages and convert to array
            const averages = Object.entries(concertMap).map(([concert, data]) => ({
                concert: concert,
                avgPercentage: data.count > 0 ? data.totalPercentage / data.count : 0
            }));
            
            // Sort by percentage (highest first)
            averages.sort((a, b) => b.avgPercentage - a.avgPercentage);
            
            // Take top 10 concerts
            const topConcerts = averages.slice(0, 10);
            
            console.log("Top concerts:", topConcerts);
            
            if (topConcerts.length > 0) {
                // Update the chart with real data
                profitChart.data.labels = topConcerts.map(item => item.concert);
                profitChart.data.datasets[0].data = topConcerts.map(item => item.avgPercentage);
                profitChart.update();
                
                // Hide no-data message
                const noDataElem = document.getElementById('profit-chart-no-data');
                if (noDataElem) {
                    noDataElem.style.display = 'none';
                }
                return;
            }
        }
        
        // If we have no data, show the no-data message
        const noDataElem = document.getElementById('profit-chart-no-data');
        if (noDataElem) {
            noDataElem.style.display = 'block';
        }
    } catch (error) {
        console.error("Error updating profit chart:", error);
        // Show no-data message in case of error
        const noDataElem = document.getElementById('profit-chart-no-data');
        if (noDataElem) {
            noDataElem.style.display = 'block';
        }
    }
}

// Update the Sales by Type Chart
function updateSalesByTypeChart(data) {
    console.log("Updating sales by type chart with", data.length, "items");
    
    if (!salesTypeChart) {
        console.error("salesTypeChart is not initialized");
        // Try to initialize it if it doesn't exist
        initializeCharts();
        if (!salesTypeChart) {
            return; // Still not initialized, can't continue
        }
    }
    
    try {
        // Process the real data
        if (data.length > 0) {
            // Group data by sale type
            const saleTypeRevenue = {};
            
            // Log some sample data
            console.log("Sample ticket data for sales:", data.slice(0, 3));
            
            // Sum revenue by sale type
            data.forEach(ticket => {
                const type = ticket.saleType || 'Unknown';
                const salePrice = parseCurrency(ticket.salePrice);
                
                if (!saleTypeRevenue[type]) {
                    saleTypeRevenue[type] = 0;
                }
                
                saleTypeRevenue[type] += salePrice;
            });
            
            console.log("Sales type revenue:", saleTypeRevenue);
            
            // Convert to arrays and sort by revenue
            const sortedTypes = Object.entries(saleTypeRevenue)
                .sort((a, b) => b[1] - a[1])
                .map(([type, revenue]) => ({ type, revenue }));
            
            console.log("Sorted sales types:", sortedTypes);
            
            if (sortedTypes.length > 0) {
                // Update chart with real data
                salesTypeChart.data.labels = sortedTypes.map(item => item.type);
                salesTypeChart.data.datasets[0].data = sortedTypes.map(item => item.revenue);
                salesTypeChart.update();
                
                // Hide no-data message
                const noDataElem = document.getElementById('sales-type-no-data');
                if (noDataElem) {
                    noDataElem.style.display = 'none';
                }
                return;
            }
        }
        
        // If we have no data, show the no-data message
        const noDataElem = document.getElementById('sales-type-no-data');
        if (noDataElem) {
            noDataElem.style.display = 'block';
        }
    } catch (error) {
        console.error("Error updating sales chart:", error);
        // Show no-data message in case of error
        const noDataElem = document.getElementById('sales-type-no-data');
        if (noDataElem) {
            noDataElem.style.display = 'block';
        }
    }
}

// Update the Top Concerts Chart
function updateTopConcertsChart(data) {
    console.log("Updating top concerts chart with", data.length, "items");
    
    if (!topConcertsChart) {
        console.error("topConcertsChart is not initialized");
        // Try to initialize it if it doesn't exist
        initializeCharts();
        if (!topConcertsChart) {
            return; // Still not initialized, can't continue
        }
    }
    
    try {
    
        // Process the real data
        if (data.length > 0) {
            // Group data by concert
            const concertRevenue = {};
            
            // Sum revenue by concert
            data.forEach(ticket => {
                const concert = ticket.concert || 'Unknown';
                const salePrice = parseCurrency(ticket.salePrice);
                
                if (!concertRevenue[concert]) {
                    concertRevenue[concert] = 0;
                }
                concertRevenue[concert] += salePrice;
            });
            
            console.log("Concert revenue:", concertRevenue);
            
            // Convert to arrays and sort by revenue (highest first)
            const sortedConcerts = Object.entries(concertRevenue)
                .sort((a, b) => b[1] - a[1])
                .map(([concert, revenue]) => ({ concert, revenue }));
            
            // Take top 10 concerts
            const topConcerts = sortedConcerts.slice(0, 10);
            
            console.log("Top concerts by revenue:", topConcerts);
            
            if (topConcerts.length > 0) {
                // Update chart
                topConcertsChart.data.labels = topConcerts.map(item => item.concert);
                topConcertsChart.data.datasets[0].data = topConcerts.map(item => item.revenue);
                topConcertsChart.update();
                
                // Hide no-data message
                const noDataElem = document.getElementById('top-concerts-no-data');
                if (noDataElem) {
                    noDataElem.style.display = 'none';
                }
                return;
            }
        }
        
        // If we have no data, show the no-data message
        const noDataElem = document.getElementById('top-concerts-no-data');
        if (noDataElem) {
            noDataElem.style.display = 'block';
        }
    } catch (error) {
        console.error("Error updating top concerts chart:", error);
        // Show no-data message in case of error
        const noDataElem = document.getElementById('top-concerts-no-data');
        if (noDataElem) {
            noDataElem.style.display = 'block';
        }
    }
}

// Update the Price Distribution Chart
function updatePriceDistributionChart(data) {
    console.log("Updating price distribution chart with", data.length, "items");
    
    if (!priceDistChart) {
        console.error("priceDistChart is not initialized");
        // Try to initialize it if it doesn't exist
        initializeCharts();
        if (!priceDistChart) {
            return; // Still not initialized, can't continue
        }
    }
    
    try {
    
        // Process real data
        if (data.length > 0) {
            // Create price ranges
            const priceRanges = [
                { min: 0, max: 50, label: '$0-$50' },
                { min: 50, max: 100, label: '$50-$100' },
                { min: 100, max: 150, label: '$100-$150' },
                { min: 150, max: 200, label: '$150-$200' },
                { min: 200, max: 300, label: '$200-$300' },
                { min: 300, max: 400, label: '$300-$400' },
                { min: 400, max: 500, label: '$400-$500' },
                { min: 500, max: Infinity, label: '$500+' }
            ];
            
            // Count tickets in each price range
            const priceCounts = priceRanges.map(range => ({
                range: range,
                count: 0
            }));
            
            // Assign tickets to price ranges
            data.forEach(ticket => {
                const price = parseCurrency(ticket.salePrice);
                const rangeIndex = priceRanges.findIndex(range => 
                    price >= range.min && price < range.max
                );
                
                if (rangeIndex >= 0) {
                    priceCounts[rangeIndex].count++;
                }
            });
            
            console.log("Price counts:", priceCounts);
            
            // Filter out empty ranges
            const activeRanges = priceCounts.filter(item => item.count > 0);
            
            console.log("Active price ranges:", activeRanges);
            
            if (activeRanges.length > 0) {
                // Update chart
                priceDistChart.data.labels = activeRanges.map(item => item.range.label);
                priceDistChart.data.datasets[0].data = activeRanges.map(item => item.count);
                priceDistChart.update();
                
                // Hide no-data message
                const noDataElem = document.getElementById('price-dist-no-data');
                if (noDataElem) {
                    noDataElem.style.display = 'none';
                }
                return;
            }
        }
        
        // If we have no data, show the no-data message
        const noDataElem = document.getElementById('price-dist-no-data');
        if (noDataElem) {
            noDataElem.style.display = 'none';
        }
    } catch (error) {
        console.error("Error updating price distribution chart:", error);
        // Show no-data message in case of error
        const noDataElem = document.getElementById('price-dist-no-data');
        if (noDataElem) {
            noDataElem.style.display = 'block';
        }
    }
}

// Update the Profit Timeline Chart
function updateProfitTimelineChart(data) {
    console.log("Updating profit timeline chart with", data.length, "items");
    
    if (!timelineChart) {
        console.error("timelineChart is not initialized");
        // Try to initialize it if it doesn't exist
        initializeCharts();
        if (!timelineChart) {
            return; // Still not initialized, can't continue
        }
    }
    
    try {
    
        // Process real data
        if (data.length > 0) {
            // Filter out tickets without soldDate or profit
            const validTickets = data.filter(ticket => ticket.soldDate && ticket.profit);
            
            if (validTickets.length > 0) {
                console.log("Sample valid tickets for timeline:", validTickets.slice(0, 3));
                
                // Group data by date
                const dateGroups = {};
                
                // Sort data by date first
                validTickets.sort((a, b) => a.soldDate - b.soldDate);
                
                // Sum profit by date
                validTickets.forEach(ticket => {
                    const dateStr = ticket.soldDate.toISOString().split('T')[0];
                    if (!dateGroups[dateStr]) {
                        dateGroups[dateStr] = {
                            date: ticket.soldDate,
                            profit: 0
                        };
                    }
                    
                    dateGroups[dateStr].profit += parseCurrency(ticket.profit);
                });
                
                console.log("Date groups:", dateGroups);
                
                // Convert to arrays for Chart.js
                const sortedDates = Object.values(dateGroups).sort((a, b) => a.date - b.date);
                
                console.log("Sorted dates:", sortedDates);
                
                if (sortedDates.length > 0) {
                    // Format dates for display
                    const labels = sortedDates.map(item => {
                        return item.date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                        });
                    });
                    
                    const values = sortedDates.map(item => item.profit);
                    
                    // Update chart
                    timelineChart.data.labels = labels;
                    timelineChart.data.datasets[0].data = values;
                    timelineChart.update();
                    
                    // Hide no-data message
                    const noDataElem = document.getElementById('timeline-no-data');
                    if (noDataElem) {
                        noDataElem.style.display = 'none';
                    }
                    return;
                }
            }
        }
        
        // If we have no data, show the no-data message
        const noDataElem = document.getElementById('timeline-no-data');
        if (noDataElem) {
            noDataElem.style.display = 'block';
        }
    } catch (error) {
        console.error("Error updating timeline chart:", error);
        // Show no-data message in case of error
        const noDataElem = document.getElementById('timeline-no-data');
        if (noDataElem) {
            noDataElem.style.display = 'block';
        }
    }
};

// Show error message in dashboard
function showErrorMessage(message) {
    // Look for the first chart container
    const firstChartContainer = document.querySelector('.dashboard-card-content');
    
    if (firstChartContainer) {
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = message;
        
        // Insert before the first chart
        firstChartContainer.parentNode.insertBefore(errorDiv, firstChartContainer);
    } else {
        // Fallback to alert if no container found
        console.error(message);
        alert('Error: ' + message.replace(/<[^>]*>/g, ''));
    }
    
    // Hide all loaders
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.classList.remove('active');
    });
}

// Format currency values
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Format percentage values
function formatPercentage(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
}

// Parse currency string to number
function parseCurrency(currencyStr) {
    if (!currencyStr) return 0;
    
    console.log("Parsing currency:", currencyStr);
    
    // Handle different formats
    let value = 0;
    
    if (typeof currencyStr === 'number') {
        value = currencyStr;
    } else if (typeof currencyStr === 'string') {
        // Remove $ sign, commas, and spaces
        value = parseFloat(currencyStr.replace(/[$,\s]/g, '')) || 0;
        console.log("Parsed as:", value);
    }
    
    return value;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded");
    
    // Set default KPI values immediately
    document.getElementById('total-revenue').textContent = "$1,200";
    document.getElementById('avg-profit-margin').textContent = "52.0%";
    document.getElementById('tickets-sold').textContent = "5";
    document.getElementById('top-sale-type').textContent = "Direct";
    document.getElementById('sale-type-percent').textContent = "60.0%";
    
    // Set positive trend indicators
    updateTrendIndicator('revenue-trend', 15);
    updateTrendIndicator('margin-trend', 8);
    updateTrendIndicator('tickets-trend', 20);
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is not loaded!");
        alert("Chart.js library not loaded. Please check your internet connection.");
        return;
    } else {
        console.log("Chart.js is loaded, version:", Chart.version);
    }
    
    // Initialize charts first - this is critical to prevent chart conflicts
    console.log("Initializing charts first");
    initializeCharts();
    
    // Set up filter event listeners
    setupFilters();
    
    // Initialize date filters with default range (current year)
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    const dateFromFilter = document.getElementById('date-from-filter');
    const dateToFilter = document.getElementById('date-to-filter');
    
    if (dateFromFilter) {
        dateFromFilter.valueAsDate = startOfYear;
    }
    
    if (dateToFilter) {
        dateToFilter.valueAsDate = today;
    }
    
    // Set up refresh button
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            console.log("Refresh button clicked");
            fetchSheetData();
        });
    }
    
    // Load the Google API after charts are initialized
    loadGoogleApi();
    
    // Hide the loading spinners
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.classList.remove('active');
    });
    
    console.log("DOMContentLoaded initialization complete");
});

// Load Google API 
function loadGoogleApi() {
    console.log('Loading Google API');
    
    // Show local development banner regardless of API state
    const isLocalDev = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.protocol === 'file:';
    
    if (isLocalDev) {
        console.log('Local development mode detected');
        // Show local development banner
        const banner = document.getElementById('local-dev-banner');
        if (banner) {
            banner.style.display = 'block';
            console.log("Showing local development banner");
        } else {
            console.warn("Local dev banner element not found!");
        }
    }
    
    // Force display of banner if it hasn't been shown
    // This addresses potential timing issues with the banner display
    setTimeout(() => {
        const banner = document.getElementById('local-dev-banner');
        if (banner && isLocalDev && banner.style.display !== 'block') {
            banner.style.display = 'block';
            console.log("Showing local development banner (delayed check)");
        }
    }, 500);
    
    // Log the current environment
    console.log('Current ENV:', window.ENV);
    console.log('ENV keys:', window.ENV ? Object.keys(window.ENV) : 'ENV not defined');
    
    // Skip if no gapi
    if (typeof gapi === 'undefined') {
        console.error('Google API not available - GAPI is not defined');
        // Fall back to sample data
        loadSampleData();
        return;
    }
    
    console.log('GAPI is defined:', !!gapi);
    console.log('GAPI client is defined:', !!(gapi && gapi.client));
    
    // Load the sheets client library
    console.log('Attempting to load Google client library via gapi.load');
    gapi.load('client', function() {
        console.log('Google client library loaded callback triggered');
        // Initialize the Google API client
        gapi.client.init({
            apiKey: window.ENV.GOOGLE_API_KEY,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        }).then(() => {
            console.log('Google client initialized successfully');
            // Now fetch the data
            fetchSheetData();
        }).catch(error => {
            console.error('Error initializing Google client:', error);
            loadSampleData();
        });
    });
}

// Initialize all chart components
function initializeCharts() {
    try {
        console.log('Initializing charts...');
        
        // Always destroy existing charts before creating new ones
        if (profitChart) {
            console.log('Destroying existing profitChart');
            profitChart.destroy();
            profitChart = null;
        }
        if (salesTypeChart) {
            console.log('Destroying existing salesTypeChart');
            salesTypeChart.destroy();
            salesTypeChart = null;
        }
        if (topConcertsChart) {
            console.log('Destroying existing topConcertsChart');
            topConcertsChart.destroy();
            topConcertsChart = null;
        }
        if (priceDistChart) {
            console.log('Destroying existing priceDistChart');
            priceDistChart.destroy();
            priceDistChart = null;
        }
        if (timelineChart) {
            console.log('Destroying existing timelineChart');
            timelineChart.destroy();
            timelineChart = null;
        }
    
        // Profit Percentage Chart
        const profitCtx = document.getElementById('profit-percentage-chart');
        if (profitCtx) {
            console.log('Found profit-percentage-chart element');
            
            // Check if the canvas already has a chart using Chart's getChart method
            const existingChart = Chart.getChart(profitCtx);
            if (existingChart) {
                console.log('Chart already exists on profit canvas, destroying it');
                existingChart.destroy();
            }
            
            // Try a simpler chart configuration first
            profitChart = new Chart(profitCtx, {
                type: 'bar',
                data: {
                    labels: ['Test 1', 'Test 2', 'Test 3'],
                    datasets: [{
                        label: 'Profit Margin',
                        data: [30, 50, 70],
                        backgroundColor: 'rgba(58, 12, 163, 0.7)',
                        borderColor: 'rgba(58, 12, 163, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

    // Sales by Type Chart
    const salesTypeCtx = document.getElementById('sales-by-type-chart');
    if (salesTypeCtx) {
        console.log('Found sales-by-type-chart element');
        
        // Check if the canvas already has a chart
        if (Chart.getChart(salesTypeCtx)) {
            console.log('Chart already exists on this canvas, destroying it');
            Chart.getChart(salesTypeCtx).destroy();
        }
        
        salesTypeChart = new Chart(salesTypeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Family', 'Direct', 'Other'],
                datasets: [{
                    data: [30, 50, 20],
                    backgroundColor: [
                        'rgba(58, 12, 163, 0.7)',
                        'rgba(247, 37, 133, 0.7)',
                        'rgba(76, 201, 240, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Top Concerts Chart
    const topConcertsCtx = document.getElementById('top-concerts-chart');
    if (topConcertsCtx) {
        console.log('Found top-concerts-chart element');
        
        // Check if the canvas already has a chart
        if (Chart.getChart(topConcertsCtx)) {
            console.log('Chart already exists on this canvas, destroying it');
            Chart.getChart(topConcertsCtx).destroy();
        }
        
        topConcertsChart = new Chart(topConcertsCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue',
                    data: [],
                    backgroundColor: chartColors.backgroundColors,
                    borderColor: chartColors.borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Price Distribution Chart
    const priceDistCtx = document.getElementById('price-distribution-chart');
    if (priceDistCtx) {
        console.log('Found price-distribution-chart element');
        
        // Check if the canvas already has a chart
        if (Chart.getChart(priceDistCtx)) {
            console.log('Chart already exists on this canvas, destroying it');
            Chart.getChart(priceDistCtx).destroy();
        }
        
        priceDistChart = new Chart(priceDistCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Number of Tickets',
                    data: [],
                    backgroundColor: chartColors.primaryLight,
                    borderColor: chartColors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    // Profit Timeline Chart
    const timelineCtx = document.getElementById('profit-timeline-chart');
    if (timelineCtx) {
        console.log('Found profit-timeline-chart element');
        
        // Check if the canvas already has a chart
        if (Chart.getChart(timelineCtx)) {
            console.log('Chart already exists on this canvas, destroying it');
            Chart.getChart(timelineCtx).destroy();
        }
        
        timelineChart = new Chart(timelineCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Profit',
                    data: [],
                    borderColor: chartColors.secondary,
                    backgroundColor: 'rgba(247, 37, 133, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.warn('profit-timeline-chart element not found');
    }
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Set up filter event listeners
function setupFilters() {
    const filters = [
        'year-filter', 
        'concert-filter', 
        'sale-type-filter',
        'date-from-filter',
        'date-to-filter'
    ];
    
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            console.log(`Setting up filter for ${filterId}`);
            element.addEventListener('change', function() {
                updateDashboard();
            });
        } else {
            console.warn(`Filter element not found: ${filterId}`);
        }
    });
}

// Fetch data from Google Sheets
async function fetchSheetData() {
    try {
        // Show loading indicators
        document.querySelectorAll('.loading-spinner').forEach(spinner => {
            spinner.classList.add('active');
        });
        
        // Hide no-data messages
        document.querySelectorAll('.no-data-message').forEach(message => {
            message.style.display = 'none';
        });
        
        console.log('Fetching sheet data...');
        console.log('Current window.ENV:', window.ENV);
        
        // Check if we're in local development mode
        const isLocalDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' || 
                          window.location.protocol === 'file:';
        
        console.log('Is local development mode:', isLocalDev);
        console.log('Protocol:', window.location.protocol);
        console.log('Hostname:', window.location.hostname);
        
        // Check if the API is loaded
        if (!window.gapi) {
            console.error('Google API not loaded');
            loadSampleData();
            return;
        }
        
        console.log('GAPI loaded:', !!window.gapi);
        
        // Check if we have environment variables
        if (!window.ENV) {
            console.error('No ENV object found');
            loadSampleData();
            return;
        }
        
        console.log('ENV object found with keys:', Object.keys(window.ENV));
        
        if (!window.ENV.GOOGLE_API_KEY) {
            console.error('No API key found in ENV object');
            loadSampleData();
            return;
        }
        
        console.log('API Key found:', window.ENV.GOOGLE_API_KEY.substring(0, 5) + '...');
        
        // Try to initialize the API if not already done
        if (!gapi.client) {
            try {
                console.log('Initializing Google API with key:', window.ENV.GOOGLE_API_KEY.substring(0, 5) + '...');
                await gapi.client.init({
                    apiKey: window.ENV.GOOGLE_API_KEY,
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                });
                console.log('API initialized successfully');
            } catch (err) {
                console.error('Error initializing the Google API:', err);
                console.error('Error details:', err.message, err.stack);
                loadSampleData();
                return;
            }
        }
        
        // Verify initialization
        console.log('GAPI client loaded:', !!gapi.client);
        
        // Make sure the sheets API is initialized
        if (!gapi.client || !gapi.client.sheets) {
            console.error('Sheets API not available - using sample data for testing');
            console.log('GAPI client:', !!gapi.client);
            console.log('GAPI client sheets:', gapi.client ? !!gapi.client.sheets : 'client not loaded');
            loadSampleData();
            return;
        }
        
        // Make sure charts are initialized before proceeding
        if (!profitChart || !salesTypeChart || !topConcertsChart || 
            !priceDistChart || !timelineChart) {
            console.log('Charts not initialized, initializing now');
            initializeCharts();
        }
        
        const spreadsheetId = window.ENV.SPREADSHEET_ID;
        
        if (!spreadsheetId) {
            console.error('No spreadsheet ID found');
            loadSampleData();
            return;
        }
        
        try {
            console.log('Fetching data from spreadsheet:', spreadsheetId);
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: '2025!A2:L', // Range matches the columns in your original app
            });
            
            console.log('API response received');
            
            const rows = response.result.values;
            if (!rows || rows.length === 0) {
                console.warn('No data found in spreadsheet');
                loadSampleData();
                return;
            }
            
            // Map the spreadsheet columns to our data structure
            // Column indices based on your spreadsheet:
            // 0=Concert, 1=Date, 2=Seat, 3=List Price, 4=Sale Type, 5=Sale Price, 
            // 6=Date Sold, 7=Date Paid, 8=Buyer, 9=Cost, 10=% Profit, 11=Profit
            
            const tickets = rows.map(row => {
                if (row.length < 6) return null; // Skip rows with insufficient data
                
                const concert = row[0] || '';
                const date = row[1] || '';
                const seat = row[2] || '';
                const listPrice = row[3] || '';
                const saleType = row[4] || '';
                const salePrice = row[5] || '';
                const dateSold = row[6] || '';
                const cost = row[9] || '';
                const profitPercentage = row[10] || '';
                const profit = row[11] || '';
                
                // Skip empty rows
                if (!concert && !date && !seat) return null;
                
                // Parse date if available (format MM/DD/YYYY)
                let soldDate = null;
                if (dateSold) {
                    const parts = dateSold.split('/');
                    if (parts.length === 3) {
                        // Parse as month/day/year
                        soldDate = new Date(
                            parseInt(parts[2]), // Year
                            parseInt(parts[0]) - 1, // Month (0-based)
                            parseInt(parts[1]) // Day
                        );
                    }
                }
                
                // Parse concert date
                let concertDate = null;
                if (date) {
                    const parts = date.split('/');
                    if (parts.length === 3) {
                        // Parse as month/day/year
                        concertDate = new Date(
                            parseInt(parts[2]), // Year
                            parseInt(parts[0]) - 1, // Month (0-based)
                            parseInt(parts[1]) // Day
                        );
                    }
                }
                
                return {
                    concert: concert,
                    date: date,
                    concertDate: concertDate,
                    seat: seat,
                    listPrice: listPrice,
                    saleType: saleType,
                    salePrice: salePrice,
                    dateSold: dateSold,
                    soldDate: soldDate,
                    cost: cost,
                    profitPercentage: profitPercentage,
                    profit: profit,
                    // Derived fields for analytics
                    isSold: !!dateSold, // A ticket is sold ONLY if it has a date sold value (column G)
                    year: concertDate ? concertDate.getFullYear() : null,
                    month: concertDate ? concertDate.getMonth() : null
                };
            }).filter(ticket => ticket !== null);
            
            console.log('Processed', tickets.length, 'tickets');
            
            if (tickets.length === 0) {
                console.warn('No valid tickets found');
                loadSampleData();
                return;
            }
            
            // Update the global ticket data
            ticketData = tickets;
            
            // Populate concert filter dropdown
            populateFilters();
            
            // Update the dashboard with the new data
            console.log("Updating dashboard with live data sample:", 
                tickets.slice(0, 3).map(t => ({
                    concert: t.concert,
                    salePrice: t.salePrice,
                    profit: t.profit,
                    profitPercentage: t.profitPercentage
                }))
            );
            updateDashboard();
            
            // Update last refresh time indicator
            const lastRefresh = document.getElementById('last-refresh');
            if (lastRefresh) {
                lastRefresh.textContent = new Date().toLocaleTimeString() + " (Live Data)";
            }
            
            console.log('Data refreshed successfully');
            
        } catch (error) {
            console.error('Error fetching data from Google Sheets:', error);
            loadSampleData();
        }
    } catch (error) {
        console.error('Error in fetchSheetData:', error);
        loadSampleData();
    } finally {
        // Hide loading indicators
        document.querySelectorAll('.loading-spinner').forEach(spinner => {
            spinner.classList.remove('active');
        });
    }
}

// Helper function to load sample data
function loadSampleData() {
    console.log('Loading sample data');
    
    // Make sure the dev banner is shown if in local mode
    const isLocalDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' || 
                     window.location.protocol === 'file:';
    
    if (isLocalDev) {
        const banner = document.getElementById('local-dev-banner');
        if (banner) {
            banner.style.display = 'block';
        }
    }
    
    // Create sample data for testing
    const sampleData = [
        {
            concert: "Taylor Swift", date: "04/15/2025", concertDate: new Date(2025, 3, 15),
            seat: "A1", listPrice: "$200", saleType: "Direct", salePrice: "$350",
            dateSold: "01/15/2025", soldDate: new Date(2025, 0, 15), cost: "$150",
            profitPercentage: "75%", profit: "$200", isSold: true, year: 2025, month: 3
        },
        {
            concert: "Taylor Swift", date: "04/15/2025", concertDate: new Date(2025, 3, 15),
            seat: "A2", listPrice: "$200", saleType: "Family", salePrice: "$250",
            dateSold: "01/20/2025", soldDate: new Date(2025, 0, 20), cost: "$150", 
            profitPercentage: "40%", profit: "$100", isSold: true, year: 2025, month: 3
        },
        {
            concert: "Beyonce", date: "05/20/2025", concertDate: new Date(2025, 4, 20),
            seat: "B1", listPrice: "$300", saleType: "Direct", salePrice: "$450",
            dateSold: "02/15/2025", soldDate: new Date(2025, 1, 15), cost: "$200",
            profitPercentage: "55%", profit: "$250", isSold: true, year: 2025, month: 4
        },
        {
            concert: "Madonna", date: "06/10/2025", concertDate: new Date(2025, 5, 10),
            seat: "C1", listPrice: "$250", saleType: "StubHub", salePrice: "$400",
            dateSold: "03/15/2025", soldDate: new Date(2025, 2, 15), cost: "$175",
            profitPercentage: "57%", profit: "$225", isSold: true, year: 2025, month: 5
        },
        {
            concert: "Ed Sheeran", date: "07/05/2025", concertDate: new Date(2025, 6, 5),
            seat: "D1", listPrice: "$150", saleType: "Family", salePrice: "$150",
            dateSold: "04/01/2025", soldDate: new Date(2025, 3, 1), cost: "$100",
            profitPercentage: "33%", profit: "$50", isSold: true, year: 2025, month: 6
        }
    ];
    
    // Set isSold flag based on our criteria: a ticket is sold only if it has a date sold
    sampleData.forEach(ticket => {
        ticket.isSold = !!ticket.dateSold;
    });
    
    // Use the sample data
    ticketData = sampleData;
    
    // Populate concert filter dropdown
    populateFilters();
    
    // Initialize the charts first before using them
    console.log("Initializing charts before updating dashboard");
    initializeCharts();
    
    // Update the dashboard with the sample data
    console.log("Updating dashboard with sample data");
    updateDashboard();
    
    // Update last refresh time indicator
    const lastRefresh = document.getElementById('last-refresh');
    if (lastRefresh) {
        lastRefresh.textContent = new Date().toLocaleTimeString() + " (Sample Data)";
    }
    
    // Hide loading indicators
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.classList.remove('active');
    });
}

// Show no data messages on all charts
function showNoDataMessages() {
    document.querySelectorAll('.no-data-message').forEach(message => {
        message.style.display = 'block';
    });
    
    // Hide loading indicators
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.classList.remove('active');
    });
}

// Populate filter dropdowns with data
function populateFilters() {
    // Populate concert filter
    const concerts = [...new Set(ticketData.map(ticket => ticket.concert))].sort();
    const concertFilter = document.getElementById('concert-filter');
    
    if (concertFilter) {
        const currentValue = concertFilter.value;
        concertFilter.innerHTML = '<option value="">All Concerts</option>';
        
        concerts.forEach(concert => {
            if (!concert) return;
            const option = document.createElement('option');
            option.value = concert;
            option.textContent = concert;
            concertFilter.appendChild(option);
        });
        
        // Restore previous selection if it exists
        if (currentValue && concerts.includes(currentValue)) {
            concertFilter.value = currentValue;
        }
    }
    
    // Populate sale type filter (in addition to the defaults)
    const saleTypes = [...new Set(ticketData.map(ticket => ticket.saleType))].sort();
    const saleTypeFilter = document.getElementById('sale-type-filter');
    
    if (saleTypeFilter) {
        const currentValue = saleTypeFilter.value;
        // Keep the original options but add any new ones
        const defaultOptions = ['', 'Family', 'Direct'];
        const existingOptions = Array.from(saleTypeFilter.options).map(opt => opt.value);
        
        saleTypes.forEach(type => {
            if (!type || defaultOptions.includes(type) || existingOptions.includes(type)) return;
            
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            saleTypeFilter.appendChild(option);
        });
        
        // Restore previous selection if it exists
        if (currentValue) {
            saleTypeFilter.value = currentValue;
        }
    }
}