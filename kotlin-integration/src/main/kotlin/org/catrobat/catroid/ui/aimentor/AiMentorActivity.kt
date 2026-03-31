package org.catrobat.catroid.ui.aimentor

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import org.catrobat.aitutor.ui.AiTutorFloatingActionButton
import org.catrobat.aitutor.ui.AiTutorView

/**
 * PocketCode AI Mentor Activity
 * 
 * This demonstrates how the AI Tutor SDK is integrated into PocketCode.
 * It wraps the AiTutorView composable and wires it to the current
 * script/project context from the Catrobat IDE.
 */
class AiMentorActivity : ComponentActivity() {

    companion object {
        private const val TAG = "AiMentorActivity"
        const val EXTRA_CODE_CONTEXT = "extra_code_context"
        const val EXTRA_OUTPUT_CONTEXT = "extra_output_context"
        const val EXTRA_SYSTEM_CONTEXT = "extra_system_context"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Extract context from the calling activity (ScriptActivity, FormulaEditor, etc.)
        val codeContext = intent.getStringExtra(EXTRA_CODE_CONTEXT) ?: ""
        val outputContext = intent.getStringExtra(EXTRA_OUTPUT_CONTEXT) ?: ""
        val systemContext = intent.getStringExtra(EXTRA_SYSTEM_CONTEXT)
            ?: "Catrobat visual programming language, PocketCode IDE"

        Log.d(TAG, "AI Mentor launched with code context length: ${codeContext.length}")

        setContent {
            AiMentorScreen(
                codeContext = codeContext,
                outputContext = outputContext,
                systemContext = systemContext,
                onDismiss = { finish() }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiMentorScreen(
    codeContext: String,
    outputContext: String,
    systemContext: String,
    onDismiss: () -> Unit
) {
    var showTutor by remember { mutableStateOf(true) }

    MaterialTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("AI Mentor") },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                    )
                )
            },
            floatingActionButton = {
                if (!showTutor) {
                    AiTutorFloatingActionButton(onClick = { showTutor = true })
                }
            }
        ) { paddingValues ->
            Box(modifier = Modifier.padding(paddingValues)) {
                AiTutorView(
                    show = showTutor,
                    onDismissRequest = {
                        showTutor = false
                        onDismiss()
                    },
                    codeContext = codeContext,
                    outputContext = outputContext,
                    systemContext = systemContext
                )
            }
        }
    }
}
