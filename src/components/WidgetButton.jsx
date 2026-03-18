export default function WidgetButton({toggleWidget, widgets, widgetType, icon, title}) {
    return (
        <button onClick={() => toggleWidget(widgetType)} className={`p-3 rounded-xl transition-all ${widgets[widgetType] ? 'text-[#111] cursor-pointer hover:scale-150 transition-all' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer hover:scale-150 transition-all'}`} title={title}>{icon}</button>
    )
}