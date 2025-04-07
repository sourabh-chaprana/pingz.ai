import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "@/src/features/transaction/transactionThunks";
import { RootState } from "@/src/store";

// Calendar component for date picker
const SimpleCalendar = ({ visible, onClose, onSelectDate, initialDate }) => {
  // Create a proper today date with time set to midnight for accurate comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Make sure initialDate is not in the future
  const safeInitialDate = initialDate && initialDate > today ? today : initialDate;
  const [selectedMonth, setSelectedMonth] = useState(safeInitialDate || today);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let days = [];

    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDay =
        new Date(year, month, 0).getDate() - firstDay + i + 1;
      days.push({
        day: prevMonthDay,
        currentMonth: false,
        date: new Date(year, month - 1, prevMonthDay),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }

    // Next month days
    const remainingDays = 7 - (days.length % 7 || 7);
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        currentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const nextMonth = () => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Check if the next month would be beyond the current month
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (nextMonth.getFullYear() <= currentMonth.getFullYear() && 
        nextMonth.getMonth() <= currentMonth.getMonth()) {
      setSelectedMonth(nextMonth);
    }
  };

  const prevMonth = () => {
    const prevMonth = new Date(selectedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setSelectedMonth(prevMonth);
  };

  const days = getMonthDays(selectedMonth);

  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#333" />
            </TouchableOpacity>
            <ThemedText style={styles.monthTitle}>
              {`${
                months[selectedMonth.getMonth()]
              } ${selectedMonth.getFullYear()}`}
            </ThemedText>
            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.daysHeader}>
            {daysOfWeek.map((day, index) => (
              <ThemedText key={index} style={styles.dayHeaderText}>
                {day}
              </ThemedText>
            ))}
          </View>

          <View style={styles.calendarBody}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day, dayIndex) => {
                  // Create date with time set to midnight for accurate comparison
                  const dayDate = new Date(day.date);
                  dayDate.setHours(0, 0, 0, 0);
                  
                  // Check if the day is in the future
                  const isFutureDate = dayDate > today;
                  
                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      style={[
                        styles.dayCell,
                        !day.currentMonth && styles.notCurrentMonth,
                        isFutureDate && styles.disabledDate,
                      ]}
                      onPress={() => {
                        if (!isFutureDate) {
                          onSelectDate(day.date);
                          onClose();
                        }
                      }}
                      disabled={isFutureDate}
                    >
                      <ThemedText
                        style={[
                          styles.dayText,
                          !day.currentMonth && styles.notCurrentMonthText,
                          isFutureDate && styles.disabledDateText,
                        ]}
                      >
                        {day.day}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const TransactionScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // API uses 0-based indexing

  // Get transactions data from Redux store
  const { transactions, loading, error, totalItems, totalPages, itemsPerPage } =
    useSelector((state: RootState) => state.transaction);

  // Handle navigation back
  const handleBack = () => {
    router.back();
  };

  // Format date for API (YYYY-MM-DDT18:30:00.000Z)
  const formatDateForApi = (date) => {
    if (!date) return null;
    return date.toISOString();
  };

  // Load transactions
  const loadTransactions = () => {
    const fromDate = formatDateForApi(startDate);
    const toDate = formatDateForApi(endDate);

    dispatch(
      fetchTransactions({
        page: currentPage,
        size: itemsPerPage,
        searchQuery: searchQuery || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      })
    );
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page - 1); // Convert to 0-based for API
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format date for display in buttons
  const formatButtonDate = (date) => {
    if (!date) return "Select Date";
    return formatDate(date);
  };

  // Apply filters when reset button is clicked
  const handleApplyFilters = () => {
    setCurrentPage(0); // Reset to first page

    // Log the search parameters for debugging
    console.log("Applying filters:", {
      searchQuery,
      fromDate: formatDateForApi(startDate),
      toDate: formatDateForApi(endDate),
    });

    loadTransactions();
  };

  // Fix the handleReset function to immediately apply the reset
  const handleReset = () => {
    // First update the state
    setSearchQuery("");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(0);

    // Then immediately dispatch the action with empty values
    dispatch(
      fetchTransactions({
        page: 0,
        size: itemsPerPage,
        searchQuery: undefined,
        fromDate: undefined,
        toDate: undefined,
      })
    );
  };

  // Load transactions on initial render and when filters change
  useEffect(() => {
    loadTransactions();
  }, [currentPage]); // Only reload when page changes

  // Render table header
  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <ThemedText style={[styles.headerText, styles.templateNameHeader]}>
        Template Name
      </ThemedText>
      <ThemedText style={[styles.headerText, styles.createdOnHeader]}>
        Created On
      </ThemedText>
      <ThemedText style={[styles.headerText, styles.countHeader]}>
        Count
      </ThemedText>
    </View>
  );

  // Render table row
  const renderItem = ({ item }) => {
    // Get the count value, falling back to records if count is not available
    const countValue = item.count || item.records || 0;

    return (
      <View style={styles.tableRow}>
        <ThemedText
          style={[styles.cellText, styles.templateNameCell]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.templateName}
        </ThemedText>
        <ThemedText style={[styles.cellText, styles.createdOnCell]}>
          {formatDate(item.createdOn)}
        </ThemedText>
        <ThemedText style={[styles.cellText, styles.countCell]}>
          {countValue}
        </ThemedText>
      </View>
    );
  };

  // Calculate for display (1-based)
  const displayPage = currentPage + 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Transactions</ThemedText>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by template name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.searchIcon}
            onPress={handleApplyFilters}
          >
            <Ionicons name="search" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.dateRangeSection}>
          <ThemedText style={styles.dateRangeTitle}>Date Range</ThemedText>
          <View style={styles.dateButtonsContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <ThemedText style={styles.dateButtonText}>
                {formatButtonDate(startDate)}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <ThemedText style={styles.dateButtonText}>
                {formatButtonDate(endDate)}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Ionicons name="refresh" size={18} color="#8B3DFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date pickers */}
      <SimpleCalendar
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onSelectDate={(date) => {
          // Ensure date is not in the future
          const selectedDate = new Date(date);
          selectedDate.setHours(0, 0, 0, 0);
          if (selectedDate <= today) {
            setStartDate(date);
          }
        }}
        initialDate={startDate || new Date()}
      />

      <SimpleCalendar
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onSelectDate={(date) => {
          // Ensure date is not in the future
          const selectedDate = new Date(date);
          selectedDate.setHours(0, 0, 0, 0);
          if (selectedDate <= today) {
            setEndDate(date);
          }
        }}
        initialDate={endDate || new Date()}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#8B3DFF" />
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadTransactions}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          {renderHeader()}
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  No transactions found
                </ThemedText>
              </View>
            }
          />

          {/* Pagination controls */}
          {totalItems > 0 && (
            <View style={styles.paginationContainer}>
              <View style={styles.paginationInfo}>
                <ThemedText style={styles.paginationText}>
                  Showing {currentPage * itemsPerPage + 1} to{" "}
                  {Math.min((currentPage + 1) * itemsPerPage, totalItems)} of{" "}
                  {totalItems} entries
                </ThemedText>
              </View>

              <View style={styles.paginationControls}>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    displayPage === 1 && styles.paginationButtonDisabled,
                  ]}
                  onPress={() =>
                    displayPage > 1 && handlePageChange(displayPage - 1)
                  }
                  disabled={displayPage === 1}
                >
                  <ThemedText style={styles.paginationButtonText}>
                    Previous
                  </ThemedText>
                </TouchableOpacity>

                {[...Array(totalPages).keys()].map((page) => (
                  <TouchableOpacity
                    key={page + 1}
                    style={[
                      styles.paginationButton,
                      displayPage === page + 1 && styles.paginationButtonActive,
                    ]}
                    onPress={() => handlePageChange(page + 1)}
                  >
                    <ThemedText
                      style={[
                        styles.paginationButtonText,
                        displayPage === page + 1 &&
                          styles.paginationButtonTextActive,
                      ]}
                    >
                      {page + 1}
                    </ThemedText>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    displayPage === totalPages &&
                      styles.paginationButtonDisabled,
                  ]}
                  onPress={() =>
                    displayPage < totalPages &&
                    handlePageChange(displayPage + 1)
                  }
                  disabled={displayPage === totalPages}
                >
                  <ThemedText style={styles.paginationButtonText}>
                    Next
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 55 : 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    padding: 8,
  },
  dateRangeSection: {
    marginTop: 8,
  },
  dateRangeTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  dateButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateButton: {
    flex: 2,
    height: 44,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: "#666",
  },
  applyButton: {
    flex: 1,
    height: 40,
    backgroundColor: "#8B3DFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  applyButtonText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
  },
  resetButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0e6ff",
    borderRadius: 8,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0e6ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
  },
  templateNameHeader: {
    flex: 2,
  },
  createdOnHeader: {
    flex: 1,
    textAlign: "center",
  },
  countHeader: {
    flex: 0.5,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cellText: {
    fontSize: 14,
    color: "#333",
  },
  templateNameCell: {
    flex: 2,
  },
  createdOnCell: {
    flex: 1,
    textAlign: "center",
  },
  countCell: {
    flex: 0.5,
    textAlign: "center",
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#8B3DFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 16,
  },
  paginationInfo: {
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    color: "#666",
  },
  paginationControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  paginationButtonActive: {
    backgroundColor: "#8B3DFF",
  },
  paginationButtonDisabled: {
    backgroundColor: "#f5f5f5",
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    color: "#333",
  },
  paginationButtonTextActive: {
    color: "#fff",
  },
  // Calendar styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  navButton: {
    padding: 8,
  },
  daysHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayHeaderText: {
    width: 30,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
  calendarBody: {
    marginTop: 8,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayCell: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  notCurrentMonth: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 14,
  },
  notCurrentMonthText: {
    color: "#999",
  },
  disabledDate: {
    opacity: 0.3,
    backgroundColor: '#f0f0f0',
  },
  disabledDateText: {
    color: '#aaa',
  },
});

export default TransactionScreen;
