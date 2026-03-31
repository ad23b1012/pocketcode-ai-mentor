package org.catrobat.catroid.ui.aimentor

import android.content.Context
import android.content.Intent
import org.catrobat.catroid.content.Project
import org.catrobat.catroid.content.Script
import org.catrobat.catroid.content.Sprite
import org.catrobat.catroid.content.bricks.Brick

/**
 * Helper to extract script context from PocketCode objects
 * and launch the AI Mentor with full context.
 *
 * Usage from ScriptActivity or FormulaEditorFragment:
 *   AiMentorHelper.launchMentor(context, currentProject, currentSprite, currentScript, errorLog)
 */
object AiMentorHelper {

    /**
     * Launch the AI Mentor with the current script context.
     */
    fun launchMentor(
        context: Context,
        project: Project? = null,
        sprite: Sprite? = null,
        script: Script? = null,
        compilerErrors: String? = null
    ) {
        val codeContext = buildCodeContext(project, sprite, script)
        val outputContext = compilerErrors ?: ""
        val systemContext = buildSystemContext(project)

        val intent = Intent(context, AiMentorActivity::class.java).apply {
            putExtra(AiMentorActivity.EXTRA_CODE_CONTEXT, codeContext)
            putExtra(AiMentorActivity.EXTRA_OUTPUT_CONTEXT, outputContext)
            putExtra(AiMentorActivity.EXTRA_SYSTEM_CONTEXT, systemContext)
        }
        context.startActivity(intent)
    }

    /**
     * Serialize the current script/sprite context into a human-readable format
     * that the AI can understand.
     */
    private fun buildCodeContext(
        project: Project?,
        sprite: Sprite?,
        script: Script?
    ): String {
        val sb = StringBuilder()

        project?.let {
            sb.appendLine("Project: ${it.name}")
            sb.appendLine("Sprites: ${it.defaultScene.spriteList.map { s -> s.name }}")
            sb.appendLine()
        }

        sprite?.let {
            sb.appendLine("Current Sprite: ${it.name}")
            sb.appendLine("Looks: ${it.lookList.map { l -> l.name }}")
            sb.appendLine("Sounds: ${it.soundList.map { s -> s.name }}")
            sb.appendLine("Scripts count: ${it.scriptList.size}")
            sb.appendLine()
        }

        script?.let {
            sb.appendLine("Current Script:")
            sb.appendLine("  Type: ${it.javaClass.simpleName}")
            sb.appendLine("  Bricks:")
            for (brick in it.brickList) {
                sb.appendLine("    - ${formatBrick(brick)}")
            }
        }

        return sb.toString().ifBlank { "No code context available" }
    }

    /**
     * Format a single brick into a readable description.
     */
    private fun formatBrick(brick: Brick): String {
        return "${brick.javaClass.simpleName} ${
            try { brick.toString() } catch (_: Exception) { "" }
        }".trim()
    }

    /**
     * Build system context describing the programming environment.
     */
    private fun buildSystemContext(project: Project?): String {
        val sb = StringBuilder("Catrobat visual programming language, PocketCode IDE")
        project?.let {
            sb.append(", Project: ${it.name}")
            sb.append(", Platform: Android")
            sb.append(", Catrobat Language Version: ${it.catrobatLanguageVersion}")
        }
        return sb.toString()
    }
}
