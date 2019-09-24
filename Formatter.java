class Formatter {
    public static <T> String printList(List<T> list) {
        if (list == null) {
            return "null";
        }

        String result;

        if (list.get(0) instanceof String) {
            result = list.stream().map(n -> "\"" + n + "\"").collect(Collectors.joining(",",
                    "[", "]"));
        } else if (list.get(0) instanceof List) {
            result = list.stream().map(n -> printList((List) n)).collect(Collectors.joining(",",
                    "[", "]"));
        } else {
            result = list.stream().map(n -> String.valueOf(n)).collect(Collectors.joining(",",
                    "[", "]"));
        }

        return result;
    }

    public static List inputTo2dList(String input) {
        List list;

        if (input.contains("\"")) {
            list = new ArrayList<List<String>>();
        } else {
            list = new ArrayList<List<Integer>>();
        }

        String elements[] = stripString(input).split("],\\[");

        for (int i = 0; i < elements.length; i++) {
            if (i == 0) {
                list.add(inputToList(elements[i] + "]"));
            } else if (i < elements.length-1) {
                list.add(inputToList("[" + elements[i] + "]"));
            } else {
                list.add(inputToList("[" + elements[i]));
            }
        }

        return list;
    }

    public static List inputToList(String input) {
        List list;
        boolean isString = false;

        if (input.contains("\"")) {
            list = new ArrayList<String>();
            isString = true;
        } else {
            list = new ArrayList<Integer>();
        }

        boolean first = true;

        for (String element : stripString(input).split(",")) {
            if (isString) {
                list.add(stripString(element));
            } else {
                list.add(Integer.parseInt(element));
            }
        }

        return list;
    }

    public static String stripString(String input) {
        return input.substring(1, input.length()-1);
    }

    public static String formatString(String input) {
        return "\"" + input + "\"";
    }

    public static int[] inputToIntArray(String input) {
        List<Integer> list = inputToList(input);
        int array[] = new int[list.size()];
        int i = 0;

        for (int n : list) {
            array[i++] = n;
        }

        return array;
    }

    public static String printArray(int arr[]) {
        if (arr == null) {
            return "null";
        }

        List<Integer> list = new ArrayList<>();

        for (int n : arr) {
            list.add(n);
        }

        return printList(list);
    }

    public static int[][] inputTo2dIntArray(String input) {
        List<List<Integer>> list = inputTo2dList(input);
        int arr[][] = new int[list.size()][list.get(0).size()];

        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr[0].length; j++) {
                arr[i][j] = list.get(i).get(j);
            }
        }

        return arr;
    }

    public static String print2dArray(int arr[][]) {
        if (arr == null) {
            return "null";
        }

        List<List<Integer>> list = new ArrayList<>();

        for (int i = 0; i < arr.length; i++) {
            List<Integer> temp = new ArrayList<>();
            for (int j = 0; j < arr[0].length; j++) {
                temp.add(arr[i][j]);
            }
            list.add(temp);
        }

        return printList(list);
    }

    public static String[] inputToStringArray(String input) {
        List<String> list = inputToList(input);
        String array[] = new String[list.size()];
        int i = 0;

        for (String s : list) {
            array[i++] = s;
        }

        return array;
    }

    public static String printStringArray(String arr[]) {
        if (arr == null) {
            return "null";
        }

        List<String> list = new ArrayList<>();

        for (String s : arr) {
            list.add(s);
        }

        return printList(list);
    }
}
