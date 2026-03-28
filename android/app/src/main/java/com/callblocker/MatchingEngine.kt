package com.callblocker

import kotlin.math.max
import kotlin.math.min

object MatchingEngine {

    /**
     * Normalizes a phone number for comparison.
     * - Removes spaces, dashes, parentheses
     * - Replaces +84 with 0
     *
     * @param phone The raw phone number string
     * @returns The normalized phone number string consisting only of digits
     */
    fun normalizePhoneNumber(phone: String?): String {
        if (phone.isNullOrEmpty()) {
            return ""
        }

        // Remove all non-digit and non-plus characters
        var normalized = phone.replace(Regex("[^\\d+]"), "")

        // Replace +84 prefix with 0
        if (normalized.startsWith("+84")) {
            normalized = "0" + normalized.substring(3)
        } else if (normalized.startsWith("84") && normalized.length >= 10) {
            // Handle cases where 84 is provided without +
            normalized = "0" + normalized.substring(2)
        }

        return normalized
    }

    /**
     * Calculates the Levenshtein distance between two strings.
     */
    fun calculateLevenshteinDistance(a: String, b: String): Int {
        if (a.isEmpty()) return b.length
        if (b.isEmpty()) return a.length

        val matrix = Array(b.length + 1) { IntArray(a.length + 1) }

        // Initialize the first row and column
        for (i in 0..b.length) {
            matrix[i][0] = i
        }
        for (j in 0..a.length) {
            matrix[0][j] = j
        }

        // Calculate distances
        for (i in 1..b.length) {
            for (j in 1..a.length) {
                if (b[i - 1] == a[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1]
                } else {
                    matrix[i][j] = min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1  // deletion
                        )
                    )
                }
            }
        }

        return matrix[b.length][a.length]
    }

    /**
     * Calculates the similarity percentage between two strings.
     */
    fun calculateSimilarityPercentage(a: String, b: String): Double {
        if (a == b) return 100.0
        if (a.isEmpty() && b.isEmpty()) return 100.0
        if (a.isEmpty() || b.isEmpty()) return 0.0

        val distance = calculateLevenshteinDistance(a, b)
        val maxLength = max(a.length, b.length)

        if (maxLength == 0) return 100.0

        val similarity = ((maxLength - distance).toDouble() / maxLength) * 100.0
        // Round to 2 decimal places
        return Math.round(similarity * 100.0) / 100.0
    }
}
