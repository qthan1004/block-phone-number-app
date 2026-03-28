package com.callblocker

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MatchingEngineTest {

    private val spamNumbers = listOf(
        "02488911814",
        "02488906418",
        "02488906350",
        "02488911712",
        "02488911764"
    )

    @Test
    fun `test Fuzzy matching with standard dummy digits fails to reach 75 percent safe threshold`() {
        val target = "02488900000"
        
        spamNumbers.forEach { spam ->
            val similarity = MatchingEngine.calculateSimilarityPercentage(spam, target)
            // Some have 5 distance (54%), some happen to have 0s reducing distance to 3 (72%)
            // ALL must be less than 75%
            assertTrue("Mathematically proven < 75%", similarity < 75.0)
        }
    }

    @Test
    fun `test Wildcard block blocks exactly 100 percent for the targeted prefix group`() {
        val wildcardRule = "024889*"
        
        spamNumbers.forEach { spam ->
            val similarity = MatchingEngine.calculateSimilarityPercentage(spam, wildcardRule)
            assertEquals("Wildcard should return exact 100.0% match", 100.0, similarity, 0.0)
        }
    }

    @Test
    fun `test normalization handles spaces, plus code, and retains asterisk`() {
        // Assume user typed loosely in UI: +84 24 889 11814 *
        val rawInput = "+84 24 889 11814 *"
        val normalized = MatchingEngine.normalizePhoneNumber(rawInput)
        // +84 should map to 0, spaces removed, * retained
        assertEquals("02488911814*", normalized)
    }

    @Test
    fun `test invalid wildcard prefix falls back to Levenshtein fuzziness algorithm safely`() {
        val wildcardRule = "024889*"
        val validCaller = "02888911814" // User who happens to have a similarly patterned number
        
        val similarity = MatchingEngine.calculateSimilarityPercentage(validCaller, wildcardRule)
        assertTrue("Similarity should not trigger 100% false block flag", similarity < 100.0)
    }
}
