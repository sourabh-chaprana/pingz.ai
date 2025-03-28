import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/store";
import { useRouter } from "expo-router";
import { clearSearch } from "@/src/features/search/searchSlice";
import { useState, useEffect } from "react";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 2 * COLUMN_COUNT - 32) / COLUMN_COUNT;

interface SearchResultsProps {
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query }) => {
  const { results, loading, error } = useSelector(
    (state: RootState) => state.search
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const [hasSearched, setHasSearched] = useState(false);
  const [previousQuery, setPreviousQuery] = useState("");

  // Track when search query changes to reset search state
  useEffect(() => {
    if (query !== previousQuery) {
      if (!query.trim()) {
        dispatch(clearSearch());
        setHasSearched(false);
      }
      setPreviousQuery(query);
    }
  }, [query, dispatch, previousQuery]);

  // Track when a search has completed (loading -> not loading)
  useEffect(() => {
    const isInitialState =
      !loading && results.length === 0 && !error && !hasSearched;
    const hasCompletedSearch = !loading && hasSearched;

    if (!isInitialState && !hasCompletedSearch && loading) {
      // We were loading (searching) and now we're done
      setHasSearched(true);
    }
  }, [loading, results, error, hasSearched]);

  const handleTemplatePress = (templateId: string) => {
    router.push(`/template-editor/${templateId}`);
  };

  // Show nothing when query is empty
  if (!query.trim()) {
    return null;
  }

  // Loading view
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B3DFF" />
      </View>
    );
  }

  // No results found view - only show when a search has been completed
  if (hasSearched && results.length === 0 && query.trim()) {
    return (
      <View style={styles.container}>
        <View style={styles.noResultsContainer}>
          <View style={styles.noResultsIconContainer}>
            <Ionicons name="search-outline" size={80} color="#CCCCCC" />
          </View>
          <ThemedText style={styles.noResultsTitle}>
            We couldn't find anything for "{query}"
          </ThemedText>
          <ThemedText style={styles.noResultsText}>
            Check that a typo hasn't snuck in, or try searching for something a
            little more generic.
          </ThemedText>
        </View>
      </View>
    );
  }

  // Results view when we have results
  if (results.length > 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.resultsContainer}
          contentContainerStyle={styles.resultsContent}
        >
          <View style={styles.resultsGrid}>
            {results.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.resultCard}
                onPress={() => handleTemplatePress(template.id)}
              >
                <Image
                  source={{ uri: template.url }}
                  style={styles.resultImage}
                  resizeMode="cover"
                />
                <View style={styles.resultInfo}>
                  <ThemedText style={styles.resultTitle}>
                    {template.templateName}
                  </ThemedText>
                  <ThemedText style={styles.resultAuthor}>
                    <ThemedText style={styles.authorHighlight}>
                      {template.event || "holidays"}
                    </ThemedText>
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Default view when typing but not yet searched
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  resultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  resultCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultImage: {
    width: "100%",
    height: CARD_WIDTH * 1.3,
    backgroundColor: "#f5f5f5",
  },
  resultInfo: {
    padding: 12,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  resultAuthor: {
    fontSize: 12,
    color: "#666",
  },
  authorHighlight: {
    color: "#8B3DFF",
  },
  proTag: {
    position: "absolute",
    bottom: 60,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 2,
  },
  noResultsContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default SearchResults;
