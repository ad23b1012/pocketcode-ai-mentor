package org.catrobat.catroid.ui.aimentor

import android.content.Context
import android.content.Intent
import org.catrobat.catroid.content.Project
import org.catrobat.catroid.content.Script
import org.catrobat.catroid.content.Sprite

/**
 * Integration points for adding the AI Mentor button into
 * existing PocketCode UI components.
 *
 * These snippets show exactly WHERE and HOW to wire the AI Mentor
 * into PocketCode's existing activities and fragments.
 */

// ═══════════════════════════════════════════════════════════════
// 1. ScriptActivity — Add FAB in the script editor
// ═══════════════════════════════════════════════════════════════
//
// File: catroid/src/main/java/org/catrobat/catroid/ui/SpriteActivity.kt
// Location: In the activity's layout or Compose content
//
// Example (XML Layout approach):
//   Add to activity_script.xml:
//
//   <com.google.android.material.floatingactionbutton.FloatingActionButton
//       android:id="@+id/fab_ai_mentor"
//       android:layout_width="wrap_content"
//       android:layout_height="wrap_content"
//       android:layout_gravity="bottom|end"
//       android:layout_margin="16dp"
//       android:src="@drawable/ic_ai_mentor"
//       android:contentDescription="AI Mentor"
//       app:backgroundTint="@color/ai_mentor_fab_color" />
//
// In SpriteActivity.kt onCreate():
//
//   findViewById<FloatingActionButton>(R.id.fab_ai_mentor).setOnClickListener {
//       val currentSprite = ProjectManager.getInstance().currentSprite
//       val currentProject = ProjectManager.getInstance().currentProject
//       AiMentorHelper.launchMentor(
//           context = this,
//           project = currentProject,
//           sprite = currentSprite,
//           script = null, // or get the currently selected script
//           compilerErrors = null
//       )
//   }

// ═══════════════════════════════════════════════════════════════
// 2. FormulaEditorFragment — Add help button in formula editor
// ═══════════════════════════════════════════════════════════════
//
// File: catroid/src/main/java/org/catrobat/catroid/ui/fragment/FormulaEditorFragment.kt
// 
// Add a menu item or button that sends the current formula as context:
//
//   fun onAiMentorClicked() {
//       val formulaText = formulaEditorEditText.text.toString()
//       AiMentorHelper.launchMentor(
//           context = requireContext(),
//           project = ProjectManager.getInstance().currentProject,
//           sprite = ProjectManager.getInstance().currentSprite,
//           compilerErrors = lastFormulaError // if any parse error exists
//       )
//   }

// ═══════════════════════════════════════════════════════════════
// 3. StageActivity — Help during program execution
// ═══════════════════════════════════════════════════════════════
//
// File: catroid/src/main/java/org/catrobat/catroid/stage/StageActivity.kt
//
// When the program crashes or shows unexpected behavior, offer the 
// AI Mentor with runtime error context:
//
//   fun onRuntimeError(error: String) {
//       AiMentorHelper.launchMentor(
//           context = this,
//           project = ProjectManager.getInstance().currentProject,
//           compilerErrors = "Runtime Error: $error"
//       )
//   }

// ═══════════════════════════════════════════════════════════════
// 4. ProjectListActivity — Explain downloaded projects
// ═══════════════════════════════════════════════════════════════
//
// When a student downloads a project from the community, offer
// the AI Mentor to explain it:
//
//   fun explainProject(project: Project) {
//       AiMentorHelper.launchMentor(
//           context = this,
//           project = project,
//       )
//   }

// ═══════════════════════════════════════════════════════════════
// 5. AndroidManifest.xml — Register the activity
// ═══════════════════════════════════════════════════════════════
//
//   <activity
//       android:name=".ui.aimentor.AiMentorActivity"
//       android:label="AI Mentor"
//       android:theme="@style/Theme.Catroid" />

// ═══════════════════════════════════════════════════════════════
// 6. Application class — Initialize the SDK
// ═══════════════════════════════════════════════════════════════
//
// In CatroidApplication.kt or the app's Application class:
//
//   import org.catrobat.aitutor.AiTutorInitializer
//
//   class CatroidApplication : Application() {
//       override fun onCreate() {
//           super.onCreate()
//           AiTutorInitializer.init(this)
//       }
//   }
